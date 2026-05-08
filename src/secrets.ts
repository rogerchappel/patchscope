import type { FilePatch, SecretFinding } from './types.js';

const SECRET_PATTERNS: Array<{ label: string; regex: RegExp }> = [
  { label: 'AWS access key', regex: /\bAKIA[0-9A-Z]{16}\b/g },
  { label: 'GitHub token', regex: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g },
  { label: 'Slack token', regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g },
  { label: 'private key marker', regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { label: 'secret assignment', regex: /\b(?:api[_-]?key|secret|token|password|passwd)\b\s*[:=]\s*['\"]?([A-Za-z0-9_./+=-]{16,})['\"]?/gi }
];

export function redactSecret(value: string): string {
  if (value.length <= 8) return '[redacted]';
  return `${value.slice(0, 4)}…${value.slice(-4)} (${value.length} chars)`;
}

function redactLine(line: string, pattern: RegExp): string {
  pattern.lastIndex = 0;
  return line.replace(pattern, (match: string, captured?: string) => {
    if (captured) return match.replace(captured, redactSecret(captured));
    return redactSecret(match);
  });
}

export function detectSecrets(files: FilePatch[]): SecretFinding[] {
  const findings: SecretFinding[] = [];
  for (const file of files) {
    for (const line of file.hunks) {
      if (line.kind !== 'add') continue;
      for (const pattern of SECRET_PATTERNS) {
        pattern.regex.lastIndex = 0;
        if (pattern.regex.test(line.content)) {
          findings.push({
            file: file.path,
            line: line.newLine,
            label: pattern.label,
            redacted: redactLine(line.content, pattern.regex)
          });
        }
      }
    }
  }
  return findings.sort((a, b) => `${a.file}:${a.line ?? 0}:${a.label}`.localeCompare(`${b.file}:${b.line ?? 0}:${b.label}`));
}
