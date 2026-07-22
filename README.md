# PatchScope

PatchScope is a tiny local-first review radar for git patches. Feed it a unified diff, a staged change, stdin, or your current worktree and it returns deterministic evidence: what changed, where the risk sits, which secret-like additions were caught, and what verification commands probably matter next.

It is built for developers and agentic coding loops that want a calm pre-review check before code hits GitHub.

## Why it exists

Raw diffs are noisy. PatchScope turns them into a compact map:

- touched directories, extensions, and likely subsystems
- review risk classes such as `secret`, `lockfile`, `generated`, and `missing-tests`
- redacted secret-like additions
- suggested local tests from changed paths and package scripts
- Markdown or JSON output that stays stable for the same input

## Install

Build and install the package directly from this repository:

```sh
git clone https://github.com/rogerchappel/patchscope.git
cd patchscope
npm ci
npm run build
package_archive="$(npm pack)"
npm install --global "./$package_archive"
```

Verify the installed CLI:

```sh
patchscope version
patchscope scan examples/feature.patch
```

## Quick start

```sh
patchscope scan --staged
patchscope scan examples/feature.patch --json
patchscope scan --stdin --fail-on secret,huge-generated < feature.patch
patchscope suggest-tests --staged
```

Write a Markdown report for review:

```sh
patchscope scan --staged --out patchscope.md
```

Use it as a local gate:

```sh
patchscope scan --staged --fail-on secret,huge-generated
```

## CLI

### `patchscope scan`

Inputs:

- `patchscope scan path/to.patch`
- `patchscope scan --stdin < path/to.patch`
- `patchscope scan --staged`
- `patchscope scan --worktree` (default when no input is provided)

Options:

- `--json` renders JSON instead of Markdown.
- `--out <file>` writes output to a file.
- `--fail-on <classes>` exits `1` when any listed class or risk level appears.

### `patchscope suggest-tests`

Prints likely verification commands only:

```sh
patchscope suggest-tests examples/feature.patch
```

## Risk classes

- `secret` — secret-like added values, always redacted.
- `huge-generated` — large generated or lockfile changes.
- `generated` — generated, minified, map, or lock-like files changed.
- `binary` — binary patch markers appeared.
- `lockfile` — dependency lockfiles changed.
- `large-change` — large non-generated file changes.
- `missing-tests` — source/tooling/config changed without test files in the patch.
- `missing-docs` — public surface changed without docs in the patch.
- `delete-heavy` — deletion-heavy patch that deserves focused review.

## Safety model

PatchScope is intentionally local and boring:

- no telemetry
- no network calls
- no hidden writes
- no source modification
- redacted secret reporting
- deterministic output ordering

It is not a SAST scanner, an LLM reviewer, or a CI replacement. Treat it as fast pre-review evidence.

## Verify this repo

```sh
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

## Examples

Checked-in patch fixtures live in [`examples/`](examples/):

```sh
node dist/cli.js scan examples/feature.patch
node dist/cli.js scan examples/secret.patch --json
node dist/cli.js suggest-tests examples/generated.patch
```

For a local demo that scans the feature and secret fixtures, writes Markdown and
JSON reports, and verifies that the secret-like fixture stays redacted, run:

```sh
bash examples/redacted-secret-demo.sh
```

For a step-by-step pre-review recipe, see
[`docs/tutorials/pre-review-check.md`](docs/tutorials/pre-review-check.md).
For a short video outline grounded in the checked-in fixtures, see
[`docs/promo/video-brief.md`](docs/promo/video-brief.md).

## Contributing

Issues and small PRs are welcome. Keep changes deterministic, fixture-backed, and local-first. See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/ORCHESTRATION.md](docs/ORCHESTRATION.md).

## License

MIT

## Release Readiness

Use the checked-in scripts before opening or publishing a release:

```sh
npm run check
npm test
npm run build
npm run smoke
npm run package:smoke
npm run release:check
```

The package smoke builds a tarball, installs it into a clean temporary prefix,
and runs `patchscope version` and `patchscope scan` from that installed artifact.

## Development

Run the same local checks that protect the package before opening a release or pull request:

- `npm run build`
- `npm test`
- `npm run check`
- `npm run smoke`
- `npm run package:smoke`
- `npm run release:check`
