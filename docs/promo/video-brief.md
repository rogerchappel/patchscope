# PatchScope Video Brief

## Working title

Catch risky patch signals before review without uploading the diff.

## Demo promise

Show PatchScope scanning checked-in patch fixtures and producing deterministic
Markdown and JSON reports. The key moment is the secret-like fixture: the report
should flag the risk while keeping the added value redacted.

## 60-second outline

1. Open `examples/feature.patch`, `examples/generated.patch`, and
   `examples/secret.patch` to show the fixture set.
2. Run `bash examples/redacted-secret-demo.sh`.
3. Open the temporary Markdown report for `feature.patch` and show changed
   paths, risk classes, and suggested verification commands.
4. Open the JSON report for `secret.patch` and show the `secret` risk without
   exposing a raw token value.
5. Close with the safety model: local-first, no telemetry, no hidden writes, and
   deterministic output ordering.

## Grounded claims

- PatchScope accepts patch files, stdin, staged changes, or the worktree.
- Markdown and JSON output are documented CLI modes.
- Secret-like additions are reported with redaction.
- The tool suggests likely verification commands from changed paths and package
  scripts; it is not a SAST scanner or CI replacement.
