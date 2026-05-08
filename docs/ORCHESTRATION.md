# PatchScope Orchestration Notes

PatchScope is intentionally boring to orchestrate: every command is local, deterministic, and safe to run inside developer or agent loops.

## Default agent loop

1. Generate or collect a patch.
2. Run `patchscope scan --staged --fail-on secret,huge-generated` before review.
3. Save Markdown evidence with `patchscope scan --staged --out patchscope.md` when a human needs a compact report.
4. Run suggested commands from `patchscope suggest-tests --staged` when they fit the repository.
5. Treat PatchScope as pre-review evidence, not as a replacement for CI, human review, or dedicated SAST.

## Recommended gates

- Local development: `secret`.
- Agent-created pull requests: `secret,huge-generated`.
- Release branches: `secret,huge-generated,large-change` plus normal CI.

## Safety guarantees

- No telemetry.
- No network calls.
- No hidden writes unless `--out` is provided.
- Secrets are reported only in redacted form.
- Output ordering is deterministic for diff-identical input.

## Exit codes

- `0`: scan succeeded and no requested fail-on risks were found.
- `1`: scan succeeded and a requested fail-on risk was found.
- `2`: CLI usage or runtime error.
