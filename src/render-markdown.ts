import type { ScanResult } from './types.js';

function listRecord(record: Record<string, number>): string[] {
  const entries = Object.entries(record);
  return entries.length ? entries.map(([key, value]) => `- \`${key}\`: ${value}`) : ['- None'];
}

export function renderMarkdown(result: ScanResult): string {
  const lines: string[] = [];
  lines.push('# PatchScope Report', '');
  lines.push('## Summary', '');
  lines.push(`- Files changed: ${result.summary.filesChanged}`);
  lines.push(`- Additions: ${result.summary.additions}`);
  lines.push(`- Deletions: ${result.summary.deletions}`, '');
  lines.push('## Directories', '', ...listRecord(result.summary.directories), '');
  lines.push('## Extensions', '', ...listRecord(result.summary.extensions), '');
  lines.push('## Subsystems', '');
  for (const [name, files] of Object.entries(result.summary.subsystems)) {
    lines.push(`- **${name}**: ${files.map((file) => `\`${file}\``).join(', ')}`);
  }
  if (!Object.keys(result.summary.subsystems).length) lines.push('- None');
  lines.push('', '## Risks', '');
  if (result.risks.length) {
    for (const risk of result.risks) {
      lines.push(`- **${risk.level.toUpperCase()} / ${risk.class}**: ${risk.message}`);
      lines.push(`  - Files: ${risk.files.map((file) => `\`${file}\``).join(', ')}`);
    }
  } else {
    lines.push('- No risk signals detected.');
  }
  lines.push('', '## Secret-like additions', '');
  if (result.secrets.length) {
    for (const secret of result.secrets) lines.push(`- \`${secret.file}:${secret.line ?? '?'}\` ${secret.label}: \`${secret.redacted}\``);
  } else {
    lines.push('- None detected.');
  }
  lines.push('', '## Suggested verification', '');
  for (const test of result.tests) lines.push(`- \`${test.command}\` — ${test.reason} (${test.confidence})`);
  lines.push('', '## Files', '');
  for (const file of result.files) {
    lines.push(`- \`${file.path}\`: +${file.additions} / -${file.deletions}${file.isBinary ? ' (binary)' : ''}`);
  }
  if (!result.files.length) lines.push('- No file patches parsed.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}
