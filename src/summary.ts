import { extensionOf, normalizeDirectory, stableRecord, subsystemFor } from './paths.js';
import type { FilePatch, ScanSummary } from './types.js';

function increment(map: Map<string, number>, key: string): void {
  map.set(key, (map.get(key) ?? 0) + 1);
}

export function summarize(files: FilePatch[]): ScanSummary {
  const directories = new Map<string, number>();
  const extensions = new Map<string, number>();
  const subsystems = new Map<string, Set<string>>();
  let additions = 0;
  let deletions = 0;

  for (const file of files) {
    additions += file.additions;
    deletions += file.deletions;
    increment(directories, normalizeDirectory(file.path));
    increment(extensions, extensionOf(file.path));
    const subsystem = subsystemFor(file.path);
    const paths = subsystems.get(subsystem) ?? new Set<string>();
    paths.add(file.path);
    subsystems.set(subsystem, paths);
  }

  const subsystemRecord = stableRecord([...subsystems.entries()].map(([key, value]) => [key, [...value].sort()]));
  return {
    filesChanged: files.length,
    additions,
    deletions,
    directories: stableRecord(directories),
    extensions: stableRecord(extensions),
    subsystems: subsystemRecord
  };
}
