import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const backendPath = resolve(repoRoot, 'coverage/backend/coverage-summary.json');
const frontendPath = resolve(repoRoot, 'coverage/frontend/coverage-summary.json');

function percentage(covered, total) {
  if (!Number.isFinite(covered) || !Number.isFinite(total)) {
    return '—';
  }
  if (covered < 0 || total < 0 || covered > total) {
    return '—';
  }
  return total === 0 ? '—' : `${((covered / total) * 100).toFixed(1)}%`;
}

function readJson(path, label) {
  if (!existsSync(path)) {
    if (process.env.ALLOW_MISSING_COVERAGE === 'true') {
      return null;
    }
    console.error(`Missing ${label} coverage summary: ${path}`);
    process.exit(1);
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    console.error(`Invalid ${label} coverage summary JSON (${path}): ${error.message}`);
    process.exit(1);
  }
}

const backend = readJson(backendPath, 'backend');
const frontend = readJson(frontendPath, 'frontend');
const backendCoverage = process.env.BACKEND_TEST_STATUS
  ? process.env.BACKEND_TEST_STATUS === 'PASS' && backend
  : backend;
const frontendCoverage = process.env.FRONTEND_TEST_STATUS
  ? process.env.FRONTEND_TEST_STATUS === 'PASS' && frontend
  : frontend;
const rows = [
  {
    branches: backendCoverage
      ? percentage(backendCoverage.totals?.covered_branches, backendCoverage.totals?.num_branches)
      : '—',
    lines: backendCoverage
      ? percentage(backendCoverage.totals?.covered_lines, backendCoverage.totals?.num_statements)
      : '—',
    source: 'Backend pytest',
  },
  {
    branches: frontendCoverage
      ? percentage(
          frontendCoverage.total?.branches?.covered,
          frontendCoverage.total?.branches?.total,
        )
      : '—',
    lines: frontendCoverage
      ? percentage(frontendCoverage.total?.lines?.covered, frontendCoverage.total?.lines?.total)
      : '—',
    source: 'Frontend Playwright E2E',
  },
];
const testRows = [
  {
    result: process.env.BACKEND_TEST_STATUS,
    source: 'Backend pytest',
  },
  {
    result: process.env.FRONTEND_TEST_STATUS,
    source: 'Frontend Playwright E2E',
  },
  {
    result: process.env.CONTAINER_TEST_STATUS,
    source: 'Docker container smoke',
  },
].filter((row) => row.result);

const terminal = [
  '=============================== Final Coverage Summary ===============================',
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
    ...(testRows.length
      ? [
          '## Test summary',
          '',
          '| Test surface | Result |',
          '| --- | ---: |',
          ...testRows.map((row) => `| ${row.source} | ${row.result} |`),
          '',
        ]
      : []),
  ].join('\n');

  appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
}
