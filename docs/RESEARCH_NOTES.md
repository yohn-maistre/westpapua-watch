# Research notes used for this scaffold

Research date: 29 August 2026.

## Frontend / deployment

- Astro 7.2 is the current Astro minor release used by the scaffold. The project is static-first and uses Astro's built-in CSP hashing.
  - https://astro.build/blog/astro-720/
  - https://docs.astro.build/en/reference/configuration-reference/
- Cloudflare Pages supports Astro static output and Pages Functions. Cloudflare now positions Workers as the broader default app platform, but Pages remains appropriate for this mostly-static site.
  - https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/
  - https://developers.cloudflare.com/pages/functions/
- Cloudflare Pages `_headers` applies to static assets but not Function responses, so `/api/ask` sets its own hardening headers.
  - https://developers.cloudflare.com/pages/configuration/headers/
- Instrument Sans / Instrument Serif are packaged locally with Fontsource, so the production build does not need Google Fonts or Typekit.
  - https://fontsource.org/fonts/instrument-sans
  - https://fontsource.org/fonts/instrument-serif/install

## Deployment workflow

- Cloudflare's current GitHub examples use Wrangler Action for direct Pages uploads. The included workflow uses `cloudflare/wrangler-action@v4`.
  - https://github.com/cloudflare/wrangler-action
  - https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/

## Domain privacy

- Namecheap states that Domain Privacy is free and enabled by default for eligible registrations; the current exclusion list does not list `.watch`. Always verify the cart/account state rather than assuming.
  - https://www.namecheap.com/security/domain-privacy-service/
  - https://www.namecheap.com/support/knowledgebase/article.aspx/775/37/do-you-provide-free-domain-privacy-subscriptions-with-every-newly-registered-domain/
- Public WHOIS privacy does not block lawful registrar disclosure and cannot erase historical WHOIS data that was already public.
  - https://www.namecheap.com/legal/general/domain-registration-data-disclosure-policy-guide/

## Current content sources sampled

- Jubi / West Papua Daily: https://jubi.id/ and https://en.jubi.id/
- PUSAKA Bentala Rakyat: https://pusaka.or.id/en/news/
- Human Rights Monitor: https://humanrightsmonitor.org/
- Mongabay Indonesia: https://mongabay.co.id/
- Suara Papua: https://suarapapua.com/
- United Nations Treaty Collection / Digital Library:
  - https://treaties.un.org/Pages/showDetails.aspx?clang=_en&objid=0800000280133981
  - https://digitallibrary.un.org/record/202193
- Read My World 2026: https://readmyworld.nl/
- Udeido Collective reference: https://www.biennalejogja.org/2021/en/seniman/udeido-collective/
- Cambridge scholarly analysis of the 1969 Act of Free Choice:
  - https://www.cambridge.org/core/books/sovereignty-statehood-and-state-responsibility/an-analysis-of-the-1969-act-of-free-choice-in-west-papua/6DB756FCBC96D81B76B663846A8BDE53

## Current news-clustering references

- NewsPrism: https://github.com/moguiyu/NewsPrism
- Multi-signal graph event grouping (March 2026): https://github.com/JuaniLlaberia/news_articles_grouping_research
- GDELT Pulse: https://github.com/UnbubbleHub/gdelt-pulse

The scaffold does not blindly vendor these projects. Their event-level clustering and pipeline separation patterns informed `docs/NEWS_PIPELINE.md`.
