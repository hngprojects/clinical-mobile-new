# Security Policy

## Reporting a vulnerability

Please reach out privately to a maintainer instead of opening a public issue.

## Supply chain protections

This repo defends against npm supply chain worms (Shai-Hulud and Mini Shai-Hulud) with the following layered controls:

1. **CI runner hardening**: the Shai-Hulud workflow runs under `step-security/harden-runner` with sudo disabled and outbound traffic audited.
2. **Lockfile pinning**: every install in CI uses `pnpm install --frozen-lockfile`.
3. **IOC scan**: `scripts/check-shai-hulud.sh` runs on every push, every PR, and a daily cron. It scans the lockfile, source files, and workflow names for known indicators of compromise.
4. **IOC database**: `scripts/shai-hulud-iocs.json` ships the current set of malicious package versions, file names, strings, and C2 domains. Update this file when new IOCs are published.

Run the scanner locally any time:

```sh
pnpm run security:scan
```

## If you suspect compromise

1. Stop CI immediately and revoke any active workflow tokens.
2. Run `pnpm run security:scan` locally and share the output.
3. Check your machine for persistent monitors:
   - macOS: `~/Library/LaunchAgents/*gh-token-monitor*`
   - Linux: `~/.config/systemd/user/*gh-token-monitor*`
4. Check your GitHub for unexpected public repos themed on Dune (for example "Shai-Hulud Migration", "Here We Go Again").
5. Rotate every credential the runner could see: `NPM_TOKEN`, `GITHUB_TOKEN` PATs, AWS keys, `EXPO_TOKEN`, `APPETIZE_API_TOKEN`, anything else in repo secrets.
6. Review every commit since the suspected compromise window.

## Dependency hygiene

- Be cautious adding packages from these scoped namespaces; verify the maintainer first: `@tanstack`, `@mistralai`, `@uipath`, `@guardrails`, `@squawk`, `@tallyui`, `@beproduct`.
- Prefer packages with sigstore provenance.
- Run `pnpm audit --prod --audit-level high` before merging dependency bumps.
- Avoid adding new install lifecycle scripts (`preinstall`, `postinstall`, `prepare`) without review.

## Sources

This policy tracks public guidance from CISA, Microsoft, Palo Alto Unit 42, Wiz, Aikido, StepSecurity, and Snyk. See `scripts/shai-hulud-iocs.json` for the linked references and current IOC set.
