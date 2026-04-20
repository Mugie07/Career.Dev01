// ─── utils.js — shared helpers & config ───────────────────────────────────────

// API endpoints
const TRACKER_API = 'http://127.0.0.1:8000/api';
const CLAUDE_API  = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// User's region — used by scraper to filter jobs
const USER_REGION = {
  country: 'Uganda',
  region: 'East Africa',
  // Keywords that indicate a job is open to the user's region
  acceptKeywords: [
    'worldwide', 'global', 'anywhere', 'all regions', 'remote worldwide',
    'africa', 'east africa', 'emea', 'apac', 'international',
    'open to all', 'no restriction', 'any location'
  ],
  // Keywords that indicate a job is NOT open to the user's region
  blockKeywords: [
    'us only', 'usa only', 'united states only', 'us residents only',
    'uk only', 'eu only', 'europe only', 'north america only',
    'canada only', 'australia only', 'must be located in us',
    'american only', 'us citizens only', 'us-based only'
  ]
};

// ── Global API online state (set by tracker.js on init) ──
let apiOnline = false;

// ── Panel navigation ──────────────────────────────────────────────────────────
function switchPanel(name, el) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  if (el) el.classList.add('active');
  if (name === 'tracker') loadTracker();
}

// ── HTML escape ───────────────────────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Get input value by id ─────────────────────────────────────────────────────
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

// ── Call Claude API ───────────────────────────────────────────────────────────
async function callClaude(prompt, maxTokens = 1000) {
  const response = await fetch(CLAUDE_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const result = await response.json();
  return result.content?.map(b => b.text || '').join('') || '';
}

// ── Check if a job is open to the user's region ───────────────────────────────
function isJobOpenToRegion(job) {
  const haystack = [
    job.region || '',
    job.description || '',
    job.title || '',
    job.locationPolicy || ''
  ].join(' ').toLowerCase();

  // If any block keyword appears → not open
  const blocked = USER_REGION.blockKeywords.some(kw => haystack.includes(kw));
  if (blocked) return false;

  // If any accept keyword appears → open
  const accepted = USER_REGION.acceptKeywords.some(kw => haystack.includes(kw));
  return accepted;
}

// ── Update tracker nav badge ──────────────────────────────────────────────────
function updateTrackerBadge(count) {
  const badge = document.getElementById('tracker-count');
  if (!badge) return;
  if (count !== undefined) { badge.textContent = count; return; }
  if (!apiOnline) return;
  fetch(`${TRACKER_API}/jobs`)
    .then(r => r.json())
    .then(j => { badge.textContent = j.length; })
    .catch(() => {});
}