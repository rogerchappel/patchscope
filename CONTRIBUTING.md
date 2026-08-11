# Contributing

Thanks for considering a PatchScope contribution. The project is intentionally small, deterministic, and local-first.

## Development

```sh
npm install
npm test
npm run check
npm run build
npm run smoke
```

Before opening a PR, also run:

```sh
bash scripts/validate.sh
```

## Contribution style

- Keep changes small and reviewable.
- Add or update patch fixtures for behavior changes.
- Prefer deterministic heuristics over cleverness.
- Do not add telemetry or network calls.
- Do not print raw secret values in tests, docs, or output.

## Commit style

Use concise conventional-style messages such as:

- `feat: detect binary patch markers`
- `test: cover lockfile risk classification`
- `docs: explain fail-on gates`

## Release notes

Update `CHANGELOG.md` for user-visible behavior changes.

## Publishing a release

1. Update `package.json` and `package-lock.json` to the intended semantic version and update `CHANGELOG.md`.
2. Run `npm ci` and `npm run release:check` on the release commit.
3. Create and push a tag that is exactly `v` followed by the package version (for example, package version `0.2.0` requires tag `v0.2.0`).

The release workflow rejects malformed or mismatched tags before publishing. It stages a single package tarball in the dedicated `release-artifacts/` directory and passes that exact path to GitHub rather than using a wildcard.

If a workflow run stops after creating the GitHub release, use GitHub Actions to rerun the failed jobs for the same tag. The rerun updates the existing release notes and replaces the expected tarball with `gh release upload --clobber`; it does not move or recreate the tag. Do not delete and repush a release tag to recover a partial run.
