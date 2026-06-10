# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.x     | ✓         |

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Report vulnerabilities by emailing **apkarjundeveloper@gmail.com** with:

- A description of the vulnerability and its potential impact
- Steps to reproduce or a minimal proof-of-concept
- Affected version(s)

You will receive an acknowledgement within **48 hours** and a resolution timeline within **7 days**.

Once a fix is released, the vulnerability will be disclosed publicly via a GitHub Security Advisory.

## Scope

This library is a React component library with no server-side code, no network requests, and no data persistence. The primary attack surface is:

- The `muiProps` escape hatch forwarding arbitrary props to MUI components
- Dependency vulnerabilities in peer dependencies (`@mui/material`, `react-hook-form`, `zod`)

## Out of Scope

- Vulnerabilities in peer dependencies (report those upstream)
- Issues requiring physical access to the user's machine
- Social engineering attacks
