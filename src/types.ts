export type DiffLineKind = 'context' | 'add' | 'remove' | 'meta';

export interface ParsedLine {
  kind: DiffLineKind;
  content: string;
  oldLine?: number;
  newLine?: number;
}

export interface FilePatch {
  oldPath: string | null;
  newPath: string | null;
  path: string;
  isBinary: boolean;
  isDeleted: boolean;
  isNew: boolean;
  hunks: ParsedLine[];
  additions: number;
  deletions: number;
}

export type RiskClass =
  | 'secret'
  | 'huge-generated'
  | 'generated'
  | 'binary'
  | 'lockfile'
  | 'large-change'
  | 'missing-tests'
  | 'missing-docs'
  | 'delete-heavy';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SecretFinding {
  file: string;
  line?: number;
  label: string;
  redacted: string;
}

export interface RiskFinding {
  class: RiskClass;
  level: RiskLevel;
  message: string;
  files: string[];
}

export interface TestSuggestion {
  command: string;
  reason: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface ScanSummary {
  filesChanged: number;
  additions: number;
  deletions: number;
  directories: Record<string, number>;
  extensions: Record<string, number>;
  subsystems: Record<string, string[]>;
}

export interface ScanResult {
  summary: ScanSummary;
  files: FilePatch[];
  secrets: SecretFinding[];
  risks: RiskFinding[];
  tests: TestSuggestion[];
  generatedAt: string;
}

export interface ScanOptions {
  diffText: string;
  cwd?: string;
}
