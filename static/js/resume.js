// ─── resume.js — resume generator logic ──────────────────────────────────────

// ── Resume tab switching ──────────────────────────────────────────────────────
const resumeTabs = ['info', 'experience', 'education', 'skills', 'generate'];

function resumeTab(name, el) {
  resumeTabs.forEach(t => {
    document.getElementById('rtab-' + t).style.display = t === name ? 'block' : 'none';
  });
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
}

// ── Experience blocks ─────────────────────────────────────────────────────────
let expCount = 0;

function addExpBlock() {
  expCount++;
  const id = expCount;
  const div = document.createElement('div');
  div.className = 'section-block';
  div.id = 'exp-' + id;
  div.innerHTML = `
    <button class="remove-block" onclick="removeBlock('exp-${id}')">×</button>
    <div class="form-grid" style="margin-bottom:10px;">
      <div class="field"><label>Job title</label><input id="exp-title-${id}" placeholder="Software Engineer" /></div>
      <div class="field"><label>Company</label><input id="exp-company-${id}" placeholder="Acme Corp" /></div>
      <div class="field"><label>Start date</label><input id="exp-start-${id}" placeholder="Jan 2022" /></div>
      <div class="field"><label>End date</label><input id="exp-end-${id}" placeholder="Present" /></div>
    </div>
    <div class="field">
      <label>Responsibilities / achievements</label>
      <textarea id="exp-desc-${id}" placeholder="Built a real-time API serving 50k requests/day..."></textarea>
    </div>
  `;
  document.getElementById('exp-blocks').appendChild(div);
}

// ── Education blocks ──────────────────────────────────────────────────────────
let eduCount = 0;

function addEduBlock() {
  eduCount++;
  const id = eduCount;
  const div = document.createElement('div');
  div.className = 'section-block';
  div.id = 'edu-' + id;
  div.innerHTML = `
    <button class="remove-block" onclick="removeBlock('edu-${id}')">×</button>
    <div class="form-grid">
      <div class="field"><label>Degree / qualification</label><input id="edu-deg-${id}" placeholder="B.Sc. Artificial Intelligence" /></div>
      <div class="field"><label>Institution</label><input id="edu-inst-${id}" placeholder="ISBAT University" /></div>
      <div class="field"><label>Start</label><input id="edu-start-${id}" placeholder="2021" /></div>
      <div class="field"><label>End</label><input id="edu-end-${id}" placeholder="2025" /></div>
    </div>
    <div class="field" style="margin-top:10px;">
      <label>Relevant coursework / notes</label>
      <textarea id="edu-notes-${id}" placeholder="Computer Vision, Deep Learning, Algorithms..." style="min-height:56px;"></textarea>
    </div>
  `;
  document.getElementById('edu-blocks').appendChild(div);
}

function removeBlock(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ── Collect all resume form data ──────────────────────────────────────────────
function collectResumeData() {
  const experiences = [];
  document.querySelectorAll('[id^="exp-title-"]').forEach(el => {
    const id = el.id.replace('exp-title-', '');
    experiences.push({
      title:   val('exp-title-'   + id),
      company: val('exp-company-' + id),
      start:   val('exp-start-'   + id),
      end:     val('exp-end-'     + id),
      desc:    val('exp-desc-'    + id)
    });
  });

  const educations = [];
  document.querySelectorAll('[id^="edu-deg-"]').forEach(el => {
    const id = el.id.replace('edu-deg-', '');
    educations.push({
      degree: val('edu-deg-'   + id),
      inst:   val('edu-inst-'  + id),
      start:  val('edu-start-' + id),
      end:    val('edu-end-'   + id),
      notes:  val('edu-notes-' + id)
    });
  });

  return {
    name: val('r-name'), role: val('r-role'), email: val('r-email'),
    phone: val('r-phone'), location: val('r-location'), link: val('r-link'),
    summary: val('r-summary'), techSkills: val('r-tech-skills'),
    certs: val('r-certs'), projects: val('r-projects'),
    languages: val('r-languages'), hobbies: val('r-hobbies'),
    tone: val('r-tone'), targetJob: val('r-target'),
    experiences, educations
  };
}

// ── Generate resume via Claude ────────────────────────────────────────────────
async function generateResume() {
  const data = collectResumeData();
  const btn  = document.getElementById('gen-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Generating...';

  const wrap = document.getElementById('ai-resume-wrap');
  const out  = document.getElementById('ai-resume-text');
  wrap.style.display = 'block';
  out.textContent = 'AI is crafting your resume...';

  const expText = data.experiences
    .map(e => `- ${e.title} at ${e.company} (${e.start} – ${e.end}): ${e.desc}`)
    .filter(x => x.trim() !== '- at  ( – ): ')
    .join('\n');

  const eduText = data.educations
    .map(e => `- ${e.degree}, ${e.inst} (${e.start}–${e.end}). ${e.notes}`)
    .filter(x => x.trim() !== '- ,  (–). ')
    .join('\n');

  const prompt = `You are an expert resume writer. Create a polished, ATS-friendly resume. Tone: ${data.tone}.${data.targetJob ? ' Target job: ' + data.targetJob + '.' : ''}

PERSONAL INFO:
Name: ${data.name || 'N/A'} | Role: ${data.role || 'N/A'}
Email: ${data.email || 'N/A'} | Phone: ${data.phone || 'N/A'} | Location: ${data.location || 'N/A'}
${data.link ? 'Portfolio/LinkedIn: ' + data.link : ''}

SUMMARY: ${data.summary || '(none — write a compelling professional summary)'}
EXPERIENCE:\n${expText || '(none)'}
EDUCATION:\n${eduText || '(none)'}
SKILLS: ${data.techSkills || 'N/A'}
CERTIFICATIONS: ${data.certs || 'N/A'}
PROJECTS: ${data.projects || 'N/A'}
LANGUAGES: ${data.languages || 'N/A'}

Output a complete resume in clean plain text with clear sections (SUMMARY, EXPERIENCE, EDUCATION, SKILLS, PROJECTS, CERTIFICATIONS). Use bullet points. Quantify achievements where possible. Output ONLY the resume content.`;

  try {
    const text = await callClaude(prompt, 1500);
    out.textContent = text || 'Error generating resume.';
    document.getElementById('dl-btn').style.display = 'inline-flex';
    document.getElementById('preview-btn').style.display = 'inline-flex';
  } catch (e) {
    out.textContent = 'Error: ' + e.message;
  }

  btn.disabled = false;
  btn.innerHTML = '✦ Generate with AI';
}

// ── Build PDF preview ─────────────────────────────────────────────────────────
function buildResumePreview() {
  const data   = collectResumeData();
  const aiText = document.getElementById('ai-resume-text')?.textContent || '';

  let html = `<h1>${data.name || 'Your Name'}</h1>`;
  html += `<div class="rp-contact">${[data.email, data.phone, data.location, data.link].filter(Boolean).join(' · ')}</div>`;

  if (aiText && aiText.length > 10) {
    const sections = aiText.split(/\n(?=[A-Z]{2,}(?:\s[A-Z]+)*\n|[A-Z]{2,}(?:\s[A-Z]+)*:)/g);
    sections.forEach(s => {
      const lines = s.trim().split('\n');
      if (!lines[0]) return;
      const title = lines[0].replace(/:$/, '').trim();
      const body  = lines.slice(1).join('\n').trim();
      if (!body) return;
      html += `<div class="rp-section"><h2>${title}</h2><div class="rp-entry-body" style="white-space:pre-wrap;">${body}</div></div>`;
    });
  }

  const preview = document.getElementById('resume-preview');
  preview.innerHTML = html;
  preview.classList.add('visible');
  document.getElementById('resume-preview-wrap').style.display = 'block';
  preview.scrollIntoView({ behavior: 'smooth' });
}

// ── Print resume ──────────────────────────────────────────────────────────────
function printResume() {
  const content = document.getElementById('resume-preview').innerHTML;
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>Resume</title><style>
    body{font-family:Georgia,serif;font-size:12px;line-height:1.7;color:#1a1a1a;padding:48px 52px;max-width:800px;margin:0 auto;}
    h1{font-size:24px;font-weight:700;margin-bottom:2px;}
    .rp-contact{font-size:11px;color:#555;margin-bottom:18px;}
    .rp-section{margin-bottom:16px;}
    .rp-section h2{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#333;border-bottom:1.5px solid #333;padding-bottom:3px;margin-bottom:8px;}
    .rp-entry{margin-bottom:8px;}
    .rp-entry-header{display:flex;justify-content:space-between;font-weight:600;}
    .rp-entry-sub{font-size:11px;color:#444;font-style:italic;}
    .rp-entry-body{font-size:12px;color:#333;margin-top:3px;white-space:pre-wrap;}
    @media print{body{padding:20px;}}
  </style></head><body>${content}</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

// ── Download .txt ─────────────────────────────────────────────────────────────
function downloadTxt() {
  const text = document.getElementById('ai-resume-text').textContent;
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'resume.txt';
  a.click();
}

// ── Copy output ───────────────────────────────────────────────────────────────
function copyOutput(id) {
  const text = document.getElementById(id).querySelector('span')?.textContent
             || document.getElementById(id).textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.copy-btn');
    if (btn) { btn.textContent = 'copied!'; setTimeout(() => btn.textContent = 'copy', 1500); }
  });
}

// ── Init: add default blocks ──────────────────────────────────────────────────
addExpBlock();
addEduBlock();