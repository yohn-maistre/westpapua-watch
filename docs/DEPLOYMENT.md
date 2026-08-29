# Deployment: GitHub → Cloudflare Pages → Namecheap domain

## 1. Before the first push

1. Copy `.env.example` to `.env` only for local development. Never commit it.
2. Run `npm install` and `npm run build`.
3. The site works without an LLM key. `/api/ask` will return a configuration message until `GROQ_API_KEY` is set in Cloudflare.

## 2. Create the GitHub repository

```bash
git init
git add .
git commit -m "Initial West Papua Watch site"
git branch -M main
git remote add origin git@github.com:<owner>/<repo>.git
git push -u origin main
```

The repository includes two workflows:

- `ci.yml` builds and runs content checks on pull requests and pushes.
- `deploy-cloudflare.yml` builds and deploys `dist/` to Cloudflare Pages on `main`.

## 3. Create the Cloudflare Pages project once

In Cloudflare: **Workers & Pages → Create → Pages → Direct Upload** and create a project named `westpapua-watch`.

Alternatively, after authenticating Wrangler locally:

```bash
npx wrangler pages project create westpapua-watch --production-branch main
```

Do not also connect the same project to Cloudflare's built-in Git integration if you use the included GitHub Action, or every push will create two deployments.

## 4. GitHub repository secrets

Create these repository secrets under **Settings → Secrets and variables → Actions**:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Use a scoped Cloudflare token with only the permissions needed to deploy Pages. Do not use the Global API Key.

The workflow uses `cloudflare/wrangler-action@v4` and deploys `dist` to `westpapua-watch`.

## 5. Configure Ask securely

In Cloudflare: **Workers & Pages → westpapua-watch → Settings → Variables and Secrets**.

Add as an **encrypted secret**:

- `GROQ_API_KEY`

Optional plain variables:

- `ASK_MODEL=qwen/qwen3.8-27b`
- `GROQ_API_BASE=https://api.groq.com/openai/v1`

Never put the API key in `PUBLIC_*`, Astro client code, GitHub variables, or the repository.

The function is same-origin only, caps query/body size and model output, uses a small server-side retrieval corpus, returns `no-store`, and does not intentionally log questions. For durable abuse control, add a Cloudflare WAF/Rate Limiting rule for `/api/ask` or add Turnstile if traffic warrants it.

## 6. Connect the Namecheap domain

For the apex domain `westpapua.watch`, Cloudflare Pages requires the domain to be a Cloudflare DNS zone.

1. In Cloudflare, **Add a domain/site** and enter `westpapua.watch`.
2. Cloudflare will assign two authoritative nameservers.
3. In Namecheap: **Domain List → Manage → Nameservers → Custom DNS**.
4. Replace Namecheap BasicDNS nameservers with the two Cloudflare nameservers exactly.
5. Wait for Cloudflare to confirm the zone is active.
6. In Cloudflare: **Workers & Pages → westpapua-watch → Custom domains → Set up a domain**.
7. Add `westpapua.watch`. Cloudflare creates/maintains the needed apex DNS record.
8. Also add `www.westpapua.watch` and redirect it to the apex with a Cloudflare Redirect Rule, or make it a custom Pages domain and redirect at the edge.

Cloudflare automatically provisions TLS for Pages custom domains. Keep SSL/TLS mode on the Cloudflare-recommended secure setting and do not create an insecure HTTP origin for this static deployment.

## 7. WHOIS / doxxing checklist

Namecheap provides free Domain Privacy for eligible domains and normally enables it by default. Before completing registration, verify **Domain Privacy = ON** in the cart and after purchase.

Check a public RDAP/WHOIS lookup after registration. It should not expose your personal name, home address, phone number, or personal email.

Additional precautions:

- Register using an email address dedicated to domain/infra administration, protected with MFA.
- Do not place your personal address or phone number in site metadata, Git commits, public GitHub profile fields, invoices/screenshots, or the website footer.
- Keep Namecheap and Cloudflare account recovery details private and use hardware/passkey-based MFA where available.
- Turn on registrar lock and auto-renew.
- Keep Cloudflare API tokens scoped and rotate them if exposed.
- Avoid publishing DNS records that point to a personal/home server. Pages stays behind Cloudflare and exposes no personal origin IP.

Domain Privacy hides ordinary public registration data; it is not anonymity against valid legal process, registrar records, payment records, or previously archived WHOIS data if privacy was ever disabled.

## 8. Verify after deployment

```bash
curl -I https://westpapua.watch/
curl -I https://westpapua.watch/history/
curl https://westpapua.watch/llms.txt
curl https://westpapua.watch/site.json | head
```

Check:

- HTTPS only
- CSP and security headers present
- `*.pages.dev` preview URLs carry `X-Robots-Tag: noindex`
- no secrets appear in HTML/JS bundles
- Ask works only after its secret is configured
- English/Papuan Malay route switches preserve the current route
- mobile nav remains readable at 320–430px widths
