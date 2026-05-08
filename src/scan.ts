import { parseUnifiedDiff } from './parser.js';
import { detectRisks } from './risks.js';
import { detectSecrets } from './secrets.js';
import { summarize } from './summary.js';
import { suggestTests } from './tests.js';
import type { ScanOptions, ScanResult } from './types.js';

export function scanPatch(options: ScanOptions): ScanResult {
  const files = parseUnifiedDiff(options.diffText);
  const secrets = detectSecrets(files);
  const risks = detectRisks(files, secrets);
  const tests = suggestTests(files, options.cwd ?? process.cwd());
  return {
    summary: summarize(files),
    files: files.sort((a, b) => a.path.localeCompare(b.path)),
    secrets,
    risks,
    tests,
    generatedAt: 'deterministic-local'
  };
}

export function hasFailingRisk(result: ScanResult, failOn: string[]): boolean {
  const wanted = new Set(failOn.map((item) => item.trim()).filter(Boolean));
  if (!wanted.size) return false;
  return result.risks.some((risk) => wanted.has(risk.class) || wanted.has(risk.level));
}
