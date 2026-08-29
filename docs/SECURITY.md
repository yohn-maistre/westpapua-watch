# Security notes

## Threat model

This is a public-interest publishing site. Assume:

- scraping and automated traffic;
- attempts to exhaust the LLM endpoint;
- malicious links/source submissions in future editorial tooling;
- credential phishing against maintainers;
- content tampering attempts;
- traffic spikes or denial-of-service attempts;
- efforts to infer maintainer identity from operational metadata.

Do not attribute an attack to any actor without evidence.

## Current controls

### Public site

- Static Astro output: no public database connection and no application server required for reading.
- No third-party analytics, trackers, embeds or remote fonts in the base build.
- Self-hosted Instrument Sans and Instrument Serif.
- CSP, `X-Frame-Options`, `nosniff`, restrictive Permissions Policy, COOP/CORP, HSTS and referrer policy in `public/_headers`.
- Preview `pages.dev` URLs are de-indexed.
- Core content works without JavaScript.

### Ask endpoint

- API key exists only in Cloudflare encrypted secrets.
- Same-origin request check.
- JSON body and query length limits.
- Small output cap and request timeout.
- Server-side curated retrieval corpus rather than arbitrary client-supplied context.
- Prompt explicitly treats retrieved text as data, not instructions.
- `Cache-Control: no-store`.
- No deliberate query logging or persistence in project code.
- Soft isolate-local burst limit; production should also use Cloudflare edge rate limiting/WAF.

### Repository

- `.env*`, `.dev.vars*`, Wrangler state and build output are ignored.
- CI validates builds independently of Cloudflare deployment.
- Cloudflare Pages uses its built-in GitHub integration, scoped to this repository. No Cloudflare deployment token or account ID is stored in GitHub.
- Use protected `main`, required reviews where practical, and Dependabot/security alerts.

## Before launch

- Enable GitHub, Cloudflare and Namecheap MFA/passkeys.
- Enable Namecheap Domain Privacy, registrar lock and auto-renew.
- Scope Cloudflare's GitHub App to this repository only.
- Protect `main` against force-pushes.
- Configure Cloudflare WAF/Rate Limiting for `/api/ask` if public traffic is expected immediately.
- Test security headers with Mozilla Observatory / securityheaders.com after the custom domain is live.
- Keep offline/exported copies of content and source metadata.
- Never use the public repository for sensitive source identities, unpublished testimony or private contact information.

## Content safety

The site should distinguish allegation, reporting, official statement, analysis and verified primary record. Sensitive claims should keep source-level provenance. Editorial corrections should be retained rather than silently rewriting historical snapshots once the live dossier backend is introduced.

### CSP implementation

Astro 7.2's built-in CSP support generates hashes for processed scripts and styles at build time. The project allows inline **style attributes only** because several data-driven visual states use inline CSS values; executable inline JavaScript is not broadly allowed. Cloudflare `_headers` supplies the remaining HTTP hardening headers. Pages Functions do not inherit `_headers`, so `/api/ask` sets its response headers explicitly.
