import type { FilePatch, ParsedLine } from './types.js';

function stripPrefix(path: string): string {
  if (path === '/dev/null') return path;
  return path.replace(/^[ab]\//, '');
}

const ESCAPED_BYTES: Record<string, number> = {
  a: 0x07,
  b: 0x08,
  t: 0x09,
  n: 0x0a,
  v: 0x0b,
  f: 0x0c,
  r: 0x0d,
  '"': 0x22,
  '\\': 0x5c
};

function readGitPathToken(value: string, offset = 0): { path: string; end: number } | null {
  while (value[offset] === ' ') offset += 1;
  if (offset >= value.length) return null;

  if (value[offset] !== '"') {
    const end = value.indexOf(' ', offset);
    return { path: value.slice(offset, end < 0 ? value.length : end), end: end < 0 ? value.length : end };
  }

  const bytes: number[] = [];
  let index = offset + 1;
  while (index < value.length && value[index] !== '"') {
    const character = value[index]!;
    if (character !== '\\') {
      const codePoint = value.codePointAt(index)!;
      const literal = String.fromCodePoint(codePoint);
      bytes.push(...Buffer.from(literal));
      index += literal.length;
      continue;
    }

    index += 1;
    const escape = value[index];
    if (escape === undefined) return null;
    const octal = value.slice(index).match(/^[0-7]{1,3}/)?.[0];
    if (octal) {
      bytes.push(Number.parseInt(octal, 8));
      index += octal.length;
      continue;
    }
    bytes.push(ESCAPED_BYTES[escape] ?? escape.charCodeAt(0));
    index += 1;
  }
  if (value[index] !== '"') return null;
  return { path: Buffer.from(bytes).toString('utf8'), end: index + 1 };
}

function pathFromDiffHeader(line: string): { oldPath: string | null; newPath: string | null; path: string } {
  if (!line.startsWith('diff --git ')) return { oldPath: null, newPath: null, path: 'unknown' };
  const oldToken = readGitPathToken(line, 'diff --git '.length);
  const newToken = oldToken ? readGitPathToken(line, oldToken.end) : null;
  if (!oldToken || !newToken) return { oldPath: null, newPath: null, path: 'unknown' };
  const oldPath = stripPrefix(oldToken.path);
  const newPath = stripPrefix(newToken.path);
  return { oldPath, newPath, path: newPath === '/dev/null' ? oldPath : newPath };
}

function pathFromMarkerHeader(line: string): string {
  return readGitPathToken(line, 4)?.path ?? line.slice(4).trim();
}

function parseHunkHeader(line: string): { oldLine: number; newLine: number } | null {
  const match = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
  if (!match) return null;
  return { oldLine: Number(match[1]), newLine: Number(match[2]) };
}

export function parseUnifiedDiff(input: string): FilePatch[] {
  const files: FilePatch[] = [];
  let current: FilePatch | null = null;
  let oldLine = 0;
  let newLine = 0;

  const startFile = (line: string): FilePatch => {
    const header = pathFromDiffHeader(line);
    const patch: FilePatch = {
      ...header,
      isBinary: false,
      isDeleted: false,
      isNew: false,
      hunks: [],
      additions: 0,
      deletions: 0
    };
    files.push(patch);
    return patch;
  };

  for (const rawLine of input.split(/\r?\n/)) {
    if (rawLine.startsWith('diff --git ')) {
      current = startFile(rawLine);
      oldLine = 0;
      newLine = 0;
      continue;
    }
    if (!current) {
      if (rawLine.startsWith('--- ') || rawLine.startsWith('+++ ') || rawLine.startsWith('@@ ')) {
        current = startFile('diff --git a/stdin.patch b/stdin.patch');
      } else {
        continue;
      }
    }

    if (rawLine.startsWith('Binary files ') || rawLine === 'GIT binary patch') current.isBinary = true;
    if (rawLine.startsWith('deleted file mode') || rawLine.startsWith('+++ /dev/null')) current.isDeleted = true;
    if (rawLine.startsWith('new file mode') || rawLine.startsWith('--- /dev/null')) current.isNew = true;
    if (rawLine.startsWith('--- ')) {
      const value = stripPrefix(pathFromMarkerHeader(rawLine));
      current.oldPath = value === '/dev/null' ? null : value;
      if (!current.path || current.path === 'unknown') current.path = current.oldPath ?? current.path;
      continue;
    }
    if (rawLine.startsWith('+++ ')) {
      const value = stripPrefix(pathFromMarkerHeader(rawLine));
      current.newPath = value === '/dev/null' ? null : value;
      current.path = current.newPath ?? current.oldPath ?? current.path;
      continue;
    }

    const hunk = parseHunkHeader(rawLine);
    if (hunk) {
      oldLine = hunk.oldLine;
      newLine = hunk.newLine;
      current.hunks.push({ kind: 'meta', content: rawLine });
      continue;
    }

    if (rawLine.startsWith('+') && !rawLine.startsWith('+++')) {
      current.hunks.push({ kind: 'add', content: rawLine.slice(1), newLine });
      current.additions += 1;
      newLine += 1;
      continue;
    }
    if (rawLine.startsWith('-') && !rawLine.startsWith('---')) {
      current.hunks.push({ kind: 'remove', content: rawLine.slice(1), oldLine });
      current.deletions += 1;
      oldLine += 1;
      continue;
    }
    const parsed: ParsedLine = { kind: rawLine.startsWith('\\') ? 'meta' : 'context', content: rawLine };
    if (parsed.kind === 'context') {
      parsed.oldLine = oldLine;
      parsed.newLine = newLine;
      oldLine += 1;
      newLine += 1;
    }
    current.hunks.push(parsed);
  }

  return files.filter((file) => file.path !== 'unknown' || file.additions || file.deletions || file.isBinary);
}
