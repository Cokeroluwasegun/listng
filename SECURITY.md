# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in ListNG, please report it to us **privately**:

**Email:** security@listng.com.ng

**PGP Key:** (insert key if you have one)

Please **do not** open a public GitHub issue for security vulnerabilities.

### What to include in your report

1. A clear description of the vulnerability
2. Steps to reproduce (proof-of-concept code or screenshots)
3. Impact assessment
4. Any suggested mitigations

### Our commitment

- We will acknowledge your report within **48 hours**
- We will provide an initial assessment within **5 business days**
- We will keep you informed of our progress
- We will credit you in the fix release (unless you prefer to remain anonymous)

### Safe harbor

We will not pursue legal action against researchers who:
- Make a good-faith effort to avoid privacy violations
- Do not exploit a vulnerability beyond what is necessary to demonstrate it
- Do not store or share any data accessed during research
- Report the vulnerability promptly

## Security measures we employ

- HTTPS everywhere with HSTS preload
- CSP, X-Frame-Options, X-Content-Type-Options headers
- CSRF protection on state-changing requests
- Rate limiting via Upstash Redis
- Constant-time signature comparison (Paystack webhooks)
- Encrypted biometric storage
- Argon2id password hashing (via Better Auth)
- Session cookies with `httpOnly`, `sameSite=lax`, `secure` flags
- Row-level authorization on every protected API route
- NDPR-compliant data export and deletion
- Server-side image URL validation (content-type, size, host allowlist)

## Bug bounty

We do not currently operate a paid bug bounty program. We do, however, publicly thank researchers and may offer swag.
