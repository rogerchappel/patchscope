export function helpText(): string {
  return `PatchScope — local-first patch risk radar\n\nUsage:\n  patchscope scan [patch-file] [--json] [--out file] [--fail-on classes]\n  patchscope scan --staged --fail-on secret,huge-generated\n  patchscope scan --stdin --json < feature.patch\n  patchscope suggest-tests [patch-file|--staged|--worktree|--stdin]\n\nInputs default to the current git worktree diff when no source is provided.\nRisk classes include secret, huge-generated, generated, binary, lockfile, large-change, missing-tests, missing-docs, delete-heavy.\n`;
}
