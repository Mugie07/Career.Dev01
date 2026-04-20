// ─── tracker.js — job tracker (FastAPI integration) ──────────────────────────

// ── Load and render all tracked jobs ─────────────────────────────────────────
async function loadTracker() {
  const output = document.getElementById('tracker-output');
  const banner = document.getElementById('tracker-offline-banner');

  if (!apiOnline) {
    banner.style.display = 'flex';
    output.innerHTML = '';
    return;
  }

  banner.style.display = 'none';

  try {
    const res  = await fetch(`${TRACKER_API}/jobs`);
    const jobs = await res.json();

    updateStats(jobs);
    updateTrackerBadge(jobs.length);

    if (!jobs.length) {
      output.innerHTML = `
        <div class="empty-state">
          <div class="es-icon">⬡</div>
          <p>No applications yet. Save jobs from the scraper or add manually above.</p>
        </div>`;
      return;
    }

    output.innerHTML = `<div class="tracker-list">${jobs.map(buildTrackerRow).join('')}</div>`;
  } catch (e) {
    output.innerHTML = `<div class="empty-state"><p style="color:var(--red);">Failed to load jobs from API.</p></div>`;
  }
}

// ── Build a single tracker row ────────────────────────────────────────────────
function buildTrackerRow(job) {
  return `
    <div class="tracker-row" id="trow-${job.id}">
      <div class="tracker-info">
        <div class="tracker-role">${esc(job.role)}</div>
        <div class="tracker-company">${esc(job.company)}</div>
      </div>
      <span class="tracker-status ${job.status}">${job.status}</span>
      <div class="tracker-actions">
        <select class="tracker-select" onchange="updateJobStatus(${job.id}, this.value)">
          <option value="applied"   ${job.status === 'applied'   ? 'selected' : ''}>Applied</option>
          <option value="interview" ${job.status === 'interview' ? 'selected' : ''}>Interview</option>
          <option value="hired"     ${job.status === 'hired'     ? 'selected' : ''}>Hired</option>
          <option value="rejected"  ${job.status === 'rejected'  ? 'selected' : ''}>Rejected</option>
        </select>
        <button class="tracker-del" onclick="deleteJob(${job.id})" title="Delete">×</button>
      </div>
    </div>`;
}

// ── Update stats counters ─────────────────────────────────────────────────────
function updateStats(jobs) {
  const counts = { applied: 0, interview: 0, hired: 0, rejected: 0 };
  jobs.forEach(j => { if (counts[j.status] !== undefined) counts[j.status]++; });
  document.getElementById('stat-applied').textContent   = counts.applied;
  document.getElementById('stat-interview').textContent = counts.interview;
  document.getElementById('stat-hired').textContent     = counts.hired;
  document.getElementById('stat-rejected').textContent  = counts.rejected;
}

// ── Update job status via API ─────────────────────────────────────────────────
async function updateJobStatus(id, status) {
  try {
    const res = await fetch(`${TRACKER_API}/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (!res.ok) throw new Error('Update failed');

    // Update the status badge inline without a full reload
    const row = document.getElementById('trow-' + id);
    if (row) {
      const badge = row.querySelector('.tracker-status');
      badge.className = `tracker-status ${status}`;
      badge.textContent = status;
    }

    // Refresh stats
    const allRes = await fetch(`${TRACKER_API}/jobs`);
    updateStats(await allRes.json());
  } catch (e) {
    console.error('Status update failed:', e);
  }
}

// ── Delete a job via API ──────────────────────────────────────────────────────
async function deleteJob(id) {
  try {
    await fetch(`${TRACKER_API}/jobs/${id}`, { method: 'DELETE' });

    // Remove row from DOM
    const row = document.getElementById('trow-' + id);
    if (row) row.remove();

    // Refresh stats and badge
    const res  = await fetch(`${TRACKER_API}/jobs`);
    const jobs = await res.json();
    updateStats(jobs);
    updateTrackerBadge(jobs.length);

    // Show empty state if no jobs left
    if (!jobs.length) {
      document.getElementById('tracker-output').innerHTML = `
        <div class="empty-state">
          <div class="es-icon">⬡</div>
          <p>No applications yet. Save jobs from the scraper or add manually above.</p>
        </div>`;
    }
  } catch (e) {
    console.error('Delete failed:', e);
  }
}

// ── Manually add a job ────────────────────────────────────────────────────────
async function manualAddJob() {
  const company = document.getElementById('t-company').value.trim();
  const role    = document.getElementById('t-role').value.trim();
  const status  = document.getElementById('t-status').value;

  if (!company || !role) {
    alert('Please fill in both company and role.');
    return;
  }
  if (!apiOnline) {
    alert('Tracker API is offline. Start your FastAPI server first:\nuvicorn app.main:app --reload');
    return;
  }

  try {
    const res = await fetch(`${TRACKER_API}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company, role, status })
    });

    if (res.ok) {
      document.getElementById('t-company').value = '';
      document.getElementById('t-role').value    = '';
      loadTracker(); // full refresh to show the new entry
    }
  } catch (e) {
    console.error('Manual add failed:', e);
  }
}

// ── API health check ──────────────────────────────────────────────────────────
async function checkApiHealth() {
  const dot  = document.getElementById('api-dot');
  const text = document.getElementById('api-status-text');

  try {
    const res = await fetch(`${TRACKER_API}/`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      apiOnline = true;
      dot.className = 'api-dot online';
      text.textContent = 'Tracker API online';
      updateTrackerBadge();
    } else {
      throw new Error();
    }
  } catch {
    apiOnline = false;
    dot.className = 'api-dot offline';
    text.textContent = 'Tracker API offline';
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
checkApiHealth();
setInterval(checkApiHealth, 15000); // re-check every 15 seconds