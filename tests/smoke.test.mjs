import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

const PORT = 3100;
const BASE = `http://localhost:${PORT}`;

const CASES = [
  // Home / landing
  { path: '/home', heading: 'Prep an Adobe Target activity' },
  // Root path redirects to /home — fetch follows the redirect by default
  // so we expect the home page heading here too.
  { path: '/', heading: 'Prep an Adobe Target activity' },
  // Activity Planning
  { path: '/phase-1/overview', heading: 'Activity Overview' },
  { path: '/phase-1/hypothesis', heading: 'Hypothesis' },
  { path: '/phase-1/audience', heading: 'Audience' },
  { path: '/phase-1/feasibility', heading: 'Technical Feasibility' },
  { path: '/phase-1/comparison', heading: 'Experience Comparison' },
  { path: '/phase-1/sample-size', heading: 'Sample Size' },
  { path: '/phase-1/qa', heading: 'QA Checklist' },
  { path: '/phase-1/specifications', heading: 'Generate Specifications' },
  { path: '/phase-2/launch', heading: 'Launch Checklist' },
  { path: '/phase-3/evaluation', heading: 'Evaluation Guide' },
  { path: '/phase-3/value-realisation', heading: 'Value Realisation' },
  { path: '/phase-3/archive', heading: 'Insights' },
  // Knowledge
  { path: '/knowledge/setup-walkthrough', heading: 'Set up a Target activity' },
  { path: '/knowledge/activity-types', heading: 'Target Activity Types' },
  { path: '/knowledge/methodology', heading: 'Testing Methodology' },
  { path: '/knowledge/pitfalls', heading: 'Common Pitfalls' },
  { path: '/knowledge/roles-cadence', heading: 'Roles' },
  { path: '/knowledge/prioritization', heading: 'Prioritization Framework' },
];

let server;

before(async () => {
  server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const ready = new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('server did not become ready in 30s')),
      30_000,
    );

    const onLine = (line) => {
      if (line.includes('Ready in') || line.includes('started server')) {
        clearTimeout(timeout);
        resolve();
      }
    };

    server.stdout.setEncoding('utf8');
    server.stderr.setEncoding('utf8');
    server.stdout.on('data', (chunk) => chunk.split('\n').forEach(onLine));
    server.stderr.on('data', (chunk) => chunk.split('\n').forEach(onLine));
    server.on('error', reject);
    server.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`server exited with code ${code}`));
      }
    });
  });

  await ready;
});

after(() => {
  server?.kill('SIGTERM');
});

for (const { path, heading } of CASES) {
  test(`${path} renders with "${heading}"`, async () => {
    const res = await fetch(`${BASE}${path}`);
    assert.equal(res.status, 200, `expected 200 from ${path}`);
    const html = await res.text();
    assert.match(html, new RegExp(heading), `${path} missing heading "${heading}"`);
  });
}
