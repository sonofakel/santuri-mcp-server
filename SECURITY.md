# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please email us at: **security@santuri.io**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Resolution Timeline**: Depends on severity, typically 30-90 days

### Scope

This security policy covers:
- The `santuri-mcp-server` npm package
- The MCP protocol implementation
- API client communication

Out of scope:
- The Santuri SaaS platform (report separately to security@santuri.io)
- Third-party dependencies (report to respective maintainers)

## Security Best Practices

When using this package:

1. **Keep your API key private** - Never commit it to version control
2. **Use environment variables** - Store credentials securely
3. **Keep updated** - Run `npm update santuri-mcp-server` regularly
4. **Review permissions** - The MCP server only needs network access to santuri.io

## Security Features

This package implements:
- No credential storage or logging
- HTTPS-only API communication
- Input validation with Zod schemas
- Minimal dependency footprint
- No shell execution or file system access
