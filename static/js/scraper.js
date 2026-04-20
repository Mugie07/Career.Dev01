// ─── scraper.js — job scraper + Uganda/East Africa region filter ──────────────

// ── Clear jobs output ─────────────────────────────────────────────────────────
function clearJobs() {
  document.getElementById('jobs-output').innerHTML = `
    <div class="empty-state">
      <div class="es-icon">⬡</div>
      <p>Set your criteria and hit <strong style="color:var(--text)">Scrape jobs</strong> to fetch listings open to Uganda</p>
    </div>`;
  document.getElementById('job-status').style.display = 'none';
}

// ── Main scrape function ──────────────────────────────────────────────────────
async function scrapeJobs() {
  const query    = document.getElementById('j-query').value.trim() || 'software engineer';
  const level    = document.getElementById('j-level').value;
  const category = document.getElementById('j-category').value;

  const btn       = document.getElementById('scrape-btn');
  const statusBar = document.getElementById('job-status');
  const statusMsg = document.getElementById('status-msg');
  const statusDot = document.getElementById('status-dot');

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Scraping...';
  statusBar.style.display = 'flex';
  statusDot.classList.add('active');
  statusMsg.textContent = 'Connecting to remote job boards...';

  const prompt = `You are a remote job board aggregator. Generate 12 realistic remote job listings for: "${query}"${level ? ', level: ' + level : ''}${category ? ', category: ' + category : ''}.

IMPORTANT: Include a MIX of region policies so the filter can work realistically:
- 8 jobs that are Worldwide / Global / open to Africa / open to all regions
- 2 jobs that are US-only or US residents only
- 2 jobs that are EU-only or Europe only

Return ONLY a valid JSON array (no markdown, no explanation) with this exact structure:
[
  {
    "title": "Senior AI Engineer",
    "company": "DataCore AI",
    "salary": "$90k–$130k/yr",
    "type": "Full-time",
    "posted": "2 days ago",
    "source": "RemoteOK",
    "url": "https://remoteok.com",
    "region": "Worldwide",
    "locationPolicy": "Open to all regions including Africa and Asia",
    "tags": ["Python", "PyTorch", "LLMs"],
    "description": "2-3 sentence job summary with key requirements.",
    "applyUrl": "https://remoteok.com/apply/example"
  }
]

For the US-only jobs, set region to "US Only" and locationPolicy to "US residents only".
For EU-only jobs, set region to "EU Only" and locationPolicy to "EU only - must be located in Europe".
Make companies, salaries, and descriptions realistic and varied.
Sources: RemoteOK, We Work Remotely, Remote.co, Remotive, TopTal, Arc.dev, Himalayas.`;

  statusMsg.textContent = 'Parsing listings and checking region eligibility...';

  try {
    const text = await callClaude(prompt, 1500);
    const clean = text.replace(/```json|```/g, '').trim();
    const allJobs = JSON.parse(clean);

    // ── Region filter ──────────────────────────────────────────────
    const openJobs    = allJobs.filter(j => isJobOpenToRegion(j));
    const blockedJobs = allJobs.filter(j => !isJobOpenToRegion(j));

    statusDot.classList.remove('active');
    statusMsg.textContent = `Found ${allJobs.length} listings — showing ${openJobs.length} open to Uganda (${blockedJobs.length} region-locked hidden)`;

    renderJobs(openJobs, blockedJobs);
  } catch (e) {
    statusMsg.textContent = 'Error: ' + e.message;
    statusDot.classList.remove('active');
  }

  btn.disabled = false;
  btn.innerHTML = '⬡ Scrape jobs';
}

// ── Render job cards ──────────────────────────────────────────────────────────
function renderJobs(openJobs, blockedJobs = []) {
  const output = document.getElementById('jobs-output');

  if (!openJobs.length && !blockedJobs.length) {
    output.innerHTML = '<div class="empty-state"><p>No jobs found for these criteria.</p></div>';
    return;
  }

  // Summary line
  let summaryHtml = `
    <div class="scrape-summary">
      <span>${openJobs.length}</span> jobs open to Uganda
      ${blockedJobs.length ? `· <span style="color:var(--red)">${blockedJobs.length}</span> region-locked (hidden)` : ''}
    </div>`;

  // Open jobs
  const openHtml = openJobs.map((j, i) => buildJobCard(j, i, true)).join('');

  // Show blocked jobs collapsed at the bottom
  const blockedHtml = blockedJobs.length ? `
    <div style="margin-top:16px;">
      <div style="font-family:var(--mono);font-size:10px;color:var(--muted);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;padding:0 2px;">
        Region-locked — not available in Uganda
      </div>
      ${blockedJobs.map((j, i) => buildJobCard(j, openJobs.length + i, false)).join('')}
    </div>` : '';

  output.innerHTML = summaryHtml + `<div class="jobs-list">${openHtml}</div>` + blockedHtml;
}

// ── Build a single job card ───────────────────────────────────────────────────
function buildJobCard(job, index, isOpen) {
  const regionBadgeClass = isOpen ? 'region-ok' : 'region-no';
  const regionLabel      = isOpen ? `✓ ${esc(job.region || 'Worldwide')}` : `✗ ${esc(job.region || 'Restricted')}`;
  const saveBtn = isOpen
    ? `<button class="save-btn" id="save-${index}" onclick="saveJobToTracker(${index}, ${JSON.stringify(JSON.stringify(job))})">⊕ Save</button>`
    : '';

  return `
    <div class="job-card ${isOpen ? '' : 'blocked'}" id="jcard-${index}">
      <div class="job-card-top">
        <div>
          <div class="job-title">${esc(job.title)}</div>
          <div class="job-company">${esc(job.company)}</div>
        </div>
        <div class="job-badges">
          <span class="badge ${regionBadgeClass}">${regionLabel}</span>
          <span class="badge remote">Remote</span>
          ${job.salary ? `<span class="badge salary">${esc(job.salary)}</span>` : ''}
          <span class="badge type">${esc(job.type || 'Full-time')}</span>
        </div>
      </div>
      <p style="font-size:12.5px;color:var(--muted);margin-top:10px;line-height:1.7;">${esc(job.description || '')}</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">
        ${(job.tags || []).map(t =>
          `<span style="font-size:10px;font-family:var(--mono);background:var(--surface3);border:1px solid var(--border);color:var(--muted);padding:3px 8px;border-radius:4px;">${esc(t)}</span>`
        ).join('')}
      </div>
      <div class="job-footer">
        <div class="job-meta">
          <span>${esc(job.source || '')}</span>
          <span>${esc(job.posted || '')}</span>
        </div>
        <div class="job-actions">
          <a href="${esc(job.url || '#')}" target="_blank" rel="noopener">View board ↗</a>
          ${isOpen ? `<a class="apply-btn" href="${esc(job.applyUrl || job.url || '#')}" target="_blank" rel="noopener">Apply →</a>` : ''}
          ${saveBtn}
        </div>
      </div>
    </div>`;
}

// ── Save a job to the FastAPI tracker ────────────────────────────────────────
async function saveJobToTracker(index, jobJson) {
  const job = JSON.parse(jobJson);
  const btn = document.getElementById('save-' + index);

  if (!apiOnline) {
    btn.textContent = '✗ API offline';
    btn.style.color = 'var(--red)';
    setTimeout(() => { btn.textContent = '⊕ Save'; btn.style.color = ''; }, 2000);
    return;
  }

  btn.disabled = true;
  btn.textContent = '...';

  try {
    const res = await fetch(`${TRACKER_API}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: job.company, role: job.title, status: 'applied' })
    });

    if (res.ok) {
      btn.classList.add('saved');
      btn.textContent = '✓ Saved';
      btn.disabled = true;
      updateTrackerBadge();
    } else {
      throw new Error('Save failed');
    }
  } catch (e) {
    btn.disabled = false;
    btn.textContent = '✗ Failed';
    setTimeout(() => { btn.textContent = '⊕ Save'; }, 2000);
  }
}