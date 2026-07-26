import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backendPath = resolve(repoRoot, 'coverage/backend/coverage-summary.json');
const frontendPath = resolve(repoRoot, 'frontend/coverage/coverage-summary.json');

function percentage(covered, total) {
  return total === 0 ? '—' : `${((covered / total) * 100).toFixed(1)}%`;
}

function readJson(path, label) {
  if (!existsSync(path)) {
    console.error(`Missing ${label} coverage summary: ${path}`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

const backend = readJson(backendPath, 'backend');
const frontend = readJson(frontendPath, 'frontend');
const rows = [
  {
    branches: percentage(backend.totals.covered_branches, backend.totals.num_branches),
    lines: percentage(backend.totals.covered_lines, backend.totals.num_statements),
    source: 'Backend pytest',
  },
  {
    branches: percentage(frontend.total.branches.covered, frontend.total.branches.total),
    lines: percentage(frontend.total.lines.covered, frontend.total.lines.total),
    source: 'Frontend Playwright E2E',
  },
];

const terminal = [
  'Coverage summary',
  'Test surface                 Lines  Branches',
  '---------------------------  -----  --------',
  ...rows.map(
    (row) => `${row.source.padEnd(27)}  ${row.lines.padStart(5)}  ${row.branches.padStart(8)}`,
  ),
].join('\n');

console.log(`\n${terminal}`);

if (process.env.GITHUB_STEP_SUMMARY) {
  const markdown = [
    '## Coverage summary',
    '',
    '| Test surface | Lines | Branches |',
    '| --- | ---: | ---: |',
    ...rows.map((row) => `| ${row.source} | ${row.lines} | ${row.branches} |`),
    '',
  ].join('\n');

  appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
}
