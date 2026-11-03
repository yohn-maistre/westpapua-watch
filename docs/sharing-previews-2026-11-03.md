# Sharing previews — 3 November 2026

BaseLayout includes complete Open Graph and Twitter title, description, image and alt tags with a 1200×630 brand fallback. Published story responses replace the defaults with the story title, bounded summary, canonical URL and same-origin photo endpoint. English and Indonesian metadata follow the existing language route. Story images retain publisher credit in the reader. No editorial content or reader layout was changed.

The new `/share/story/:id/image` route checks the current published story through WATCH_ENGINE. It accepts approved HTTPS publisher image hosts only, forwards no caller credentials, follows no redirects and bounds time/bytes. JPEG, PNG and WebP signatures must match their MIME type. A missing/blocked photo uses the brand card; draft/unknown stories never yield private metadata or images. Responses have short public caching; engine failures remain no-store. Static pages retain their page-specific metadata.

Validation: content, polish, system, explorer and investigation suites; bilingual HTMLRewriter sharing tests; image fallback/redirect/signature/size/credential tests; production Astro build; official Pages Functions bundle; actual compiled Pages routing test through the static fallback. Brand image inspected at 1200×630. Deployment/live verification follows separately.

Deployment is restricted to Pages for this change: preserve existing dashboard bindings and compatibility settings, engine, databases, R2 map layers and deployed geography bytes. Work stays on preview/investigative-explorer; no merge to main or full infrastructure workflow is required. Sharing services may cache older cards; existing messages cannot be refreshed by this application.
