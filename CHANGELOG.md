# Changelog

## Unreleased

- Decode Git-quoted paths, including UTF-8 octal escapes, spaces, quotes, and backslashes.

## 0.1.0

Initial MVP release:

- Parse unified diff input from files, stdin, staged diffs, and worktree diffs.
- Summarize changed files by directory, extension, and subsystem.
- Detect redacted secret-like additions.
- Classify review risk signals.
- Suggest likely local verification commands.
- Render deterministic Markdown and JSON reports.
- Include fixture-backed tests and smoke checks.
