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
