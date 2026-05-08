# Security Policy

PatchScope is a local-first CLI. It does not make network calls, collect telemetry, or upload patch content.

## Reporting a vulnerability

Please report security issues through GitHub's private vulnerability reporting for this repository when available, or open a minimal issue that does not disclose exploit details.

## Secret handling

PatchScope can detect common secret-like additions, but it is not a full secret scanner. Findings are redacted in output. If PatchScope flags a secret:

1. Remove it from the patch.
2. Rotate the underlying credential.
3. Check git history and CI logs before assuming containment.

## Supported versions

Only the latest released version is supported during the initial 0.x phase.
