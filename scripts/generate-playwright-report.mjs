#!/usr/bin/env node
/**
 * Builds a browsable HTML report under playwright-report/ from Cucumber JSON.
 * Open with: npm run playwright:report
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const jsonPath = path.join(root, 'reports', 'cucumber-report.json');
const outDir = path.join(root, 'playwright-report');
const outFile = path.join(outDir, 'index.html');

function decodeEmbeddingData(data) {
  if (data == null) return '';
  const raw = String(data);
  // Prefer raw when it already looks like readable validation text
  if (/Validation error|Validation errors:|Please /i.test(raw)) {
    return raw;
  }
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    if (!decoded || /[\u0000-\u0008]/.test(decoded)) return raw;
    return decoded;
  } catch {
    return raw;
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function collectEmbeddings(steps = []) {
  const items = [];
  for (const step of steps) {
    for (const emb of step.embeddings || []) {
      items.push({
        mime: emb.mime_type || emb.media?.type || 'text/plain',
        data: emb.data,
        name: step.name || 'attachment',
      });
    }
  }
  return items;
}

function statusClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'passed') return 'passed';
  if (s === 'failed') return 'failed';
  if (s === 'skipped' || s === 'pending' || s === 'undefined') return 'skipped';
  return 'other';
}

function formatDuration(ns) {
  if (!ns && ns !== 0) return '-';
  const ms = Math.round(ns / 1e6);
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function buildReport(features) {
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const scenarioBlocks = [];

  for (const feature of features) {
    for (const element of feature.elements || []) {
      if (element.type !== 'scenario' && element.type !== 'scenario_outline') continue;

      const steps = element.steps || [];
      const stepStatuses = steps.map((s) => s.result?.status || 'unknown');
      let scenarioStatus = 'passed';
      if (stepStatuses.includes('failed')) scenarioStatus = 'failed';
      else if (stepStatuses.every((s) => s === 'skipped' || s === 'pending' || s === 'undefined')) {
        scenarioStatus = 'skipped';
      } else if (stepStatuses.some((s) => s !== 'passed' && s !== 'skipped')) {
        scenarioStatus = stepStatuses.find((s) => s !== 'passed') || 'other';
      }

      if (scenarioStatus === 'passed') passed += 1;
      else if (scenarioStatus === 'failed') failed += 1;
      else skipped += 1;

      const duration = steps.reduce((sum, s) => sum + (s.result?.duration || 0), 0);
      const embeddings = collectEmbeddings(steps);
      const tags = (element.tags || []).map((t) => t.name).join(' ');

      const validationAttachments = embeddings.filter((e) => {
        if (!e.mime.startsWith('text/')) return false;
        const text = decodeEmbeddingData(e.data);
        return /validation|error|Please /i.test(`${e.name} ${text}`);
      });
      const textAttachments = embeddings.filter((e) => e.mime.startsWith('text/'));
      const imageAttachments = embeddings.filter((e) => e.mime.startsWith('image/'));

      const stepsHtml = steps
        .map((step) => {
          const st = step.result?.status || 'unknown';
          const err = step.result?.error_message
            ? `<pre class="error">${escapeHtml(step.result.error_message)}</pre>`
            : '';
          const stepTexts = (step.embeddings || [])
            .filter((e) => (e.mime_type || '').startsWith('text/'))
            .map((e) => {
              const text = decodeEmbeddingData(e.data);
              return `<div class="attachment text"><strong>${escapeHtml(step.keyword || '')} attachment</strong><pre>${escapeHtml(text)}</pre></div>`;
            })
            .join('');
          return `<li class="step ${statusClass(st)}"><span class="badge">${escapeHtml(st)}</span> ${escapeHtml(step.keyword || '')}${escapeHtml(step.name || '')}${err}${stepTexts}</li>`;
        })
        .join('\n');

      const imagesHtml = imageAttachments
        .map((img) => {
          const src = String(img.data || '').startsWith('data:')
            ? img.data
            : `data:${img.mime};base64,${img.data}`;
          return `<div class="attachment image"><img alt="screenshot" src="${src}" /></div>`;
        })
        .join('\n');

      const validationHtml =
        textAttachments.length > 0
          ? `<div class="validation"><h4>Validation / log messages</h4>${textAttachments
              .map((t) => {
                const text = decodeEmbeddingData(t.data);
                return `<pre class="validation-msg">${escapeHtml(text)}</pre>`;
              })
              .join('')}</div>`
          : '';

      scenarioBlocks.push(`
        <section class="scenario ${statusClass(scenarioStatus)}">
          <header>
            <h3>${escapeHtml(element.name)}</h3>
            <div class="meta">
              <span class="badge ${statusClass(scenarioStatus)}">${escapeHtml(scenarioStatus)}</span>
              <span>${escapeHtml(feature.name || '')}</span>
              <span>${escapeHtml(tags)}</span>
              <span>${formatDuration(duration)}</span>
            </div>
          </header>
          <ol class="steps">${stepsHtml}</ol>
          ${validationHtml}
          ${imagesHtml}
        </section>
      `);
    }
  }

  const total = passed + failed + skipped;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Interest Calculator – Playwright Report</title>
  <style>
    :root { --bg:#0f172a; --card:#1e293b; --text:#e2e8f0; --muted:#94a3b8; --pass:#22c55e; --fail:#ef4444; --skip:#f59e0b; }
    * { box-sizing: border-box; }
    body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background:var(--bg); color:var(--text); }
    header.app { padding:24px 32px; border-bottom:1px solid #334155; }
    h1 { margin:0 0 8px; font-size:1.5rem; }
    .summary { display:flex; gap:16px; flex-wrap:wrap; margin-top:12px; }
    .pill { background:var(--card); padding:10px 14px; border-radius:10px; min-width:110px; }
    .pill strong { display:block; font-size:1.4rem; }
    .pill.passed strong { color:var(--pass); }
    .pill.failed strong { color:var(--fail); }
    .pill.skipped strong { color:var(--skip); }
    main { padding:24px 32px; display:grid; gap:16px; }
    .scenario { background:var(--card); border-radius:12px; padding:16px 18px; border-left:4px solid #64748b; }
    .scenario.passed { border-left-color:var(--pass); }
    .scenario.failed { border-left-color:var(--fail); }
    .scenario.skipped { border-left-color:var(--skip); }
    .scenario h3 { margin:0 0 8px; }
    .meta { display:flex; gap:12px; flex-wrap:wrap; color:var(--muted); font-size:0.9rem; align-items:center; }
    .badge { text-transform:uppercase; font-size:0.7rem; letter-spacing:0.04em; padding:3px 8px; border-radius:999px; background:#334155; }
    .badge.passed { background:rgba(34,197,94,.2); color:var(--pass); }
    .badge.failed { background:rgba(239,68,68,.2); color:var(--fail); }
    .badge.skipped { background:rgba(245,158,11,.2); color:var(--skip); }
    ol.steps { margin:12px 0 0; padding-left:18px; }
    .step { margin:6px 0; }
    .step .badge { margin-right:6px; }
    pre.error, pre.validation-msg { background:#0b1220; color:#fecaca; padding:10px; border-radius:8px; overflow:auto; white-space:pre-wrap; }
    pre.validation-msg { color:#bbf7d0; border:1px solid #14532d; }
    .validation { margin-top:12px; }
    .attachment.image img { max-width:100%; border-radius:8px; margin-top:10px; border:1px solid #334155; }
    .attachment.text { margin-top:8px; }
    footer { padding:16px 32px 32px; color:var(--muted); font-size:0.85rem; }
  </style>
</head>
<body>
  <header class="app">
    <h1>Interest Calculator – Test Report</h1>
    <p>Generated from Cucumber JSON · open with <code>npm run playwright:report</code></p>
    <div class="summary">
      <div class="pill"><span>Total</span><strong>${total}</strong></div>
      <div class="pill passed"><span>Passed</span><strong>${passed}</strong></div>
      <div class="pill failed"><span>Failed</span><strong>${failed}</strong></div>
      <div class="pill skipped"><span>Skipped</span><strong>${skipped}</strong></div>
    </div>
  </header>
  <main>
    ${scenarioBlocks.join('\n') || '<p>No scenarios found in Cucumber JSON.</p>'}
  </main>
  <footer>Report generated at ${escapeHtml(new Date().toISOString())}</footer>
</body>
</html>`;
}

function main() {
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Cucumber JSON not found at ${jsonPath}. Run tests first (npm test).`);
    process.exit(1);
  }

  const features = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, buildReport(features), 'utf8');

  // Copy cucumber HTML next to it for convenience when present
  const cucumberHtml = path.join(root, 'reports', 'cucumber-report.html');
  if (fs.existsSync(cucumberHtml)) {
    fs.copyFileSync(cucumberHtml, path.join(outDir, 'cucumber-report.html'));
  }

  console.log(`✅ Playwright report generated: ${outFile}`);
  console.log('   View with: npm run playwright:report');
}

main();
