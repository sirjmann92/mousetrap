import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import libCoverage from 'istanbul-lib-coverage';
import libInstrument from 'istanbul-lib-instrument';
import libReport from 'istanbul-lib-report';
import reports from 'istanbul-reports';

const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = resolve(frontendDir, '..');
const sourceDir = resolve(frontendDir, 'src');
const rawCoverageDir = resolve(frontendDir, '.nyc_output');
const reportDir = resolve(repoRoot, 'coverage/frontend');

function findSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return findSourceFiles(path);
    }
    return /\.(js|jsx)$/.test(entry.name) ? [path] : [];
  });
}

if (!existsSync(rawCoverageDir)) {
  console.error(`No frontend coverage data found in ${rawCoverageDir}`);
  process.exit(1);
}

const coverageFiles = readdirSync(rawCoverageDir).filter((name) => name.endsWith('.json'));
if (coverageFiles.length === 0) {
  console.error(`No frontend coverage data found in ${rawCoverageDir}`);
  process.exit(1);
}

const coverageMap = libCoverage.createCoverageMap({});
for (const coverageFile of coverageFiles) {
  coverageMap.merge(JSON.parse(readFileSync(resolve(rawCoverageDir, coverageFile), 'utf8')));
}
const measuredFiles = new Set(coverageMap.files().map((path) => resolve(path)));
for (const sourceFile of findSourceFiles(sourceDir)) {
  if (!measuredFiles.has(resolve(sourceFile))) {
    const instrumenter = libInstrument.createInstrumenter({
      esModules: true,
      parserPlugins: ['jsx'],
      produceSourceMap: true,
    });
    instrumenter.instrumentSync(readFileSync(sourceFile, 'utf8'), sourceFile);
    coverageMap.addFileCoverage(instrumenter.lastFileCoverage());
  }
}

const context = libReport.createContext({
  coverageMap,
  dir: reportDir,
});
for (const reporter of ['text-summary', 'html', 'json-summary', 'lcovonly']) {
  reports.create(reporter).execute(context);
}
