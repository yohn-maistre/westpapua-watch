# Sharing previews — 3 November 2026

BaseLayout includes complete Open Graph and Twitter title, description, image and alt tags with a 1200×630 brand fallback. Published story responses replace the defaults with the story title, bounded summary, canonical URL and same-origin photo endpoint. English and Indonesian metadata follow the existing language route. Story images retain publisher credit in the reader. No editorial content or reader layout was changed.

The new `/share/story/:id/image` route checks the current published story through WATCH_ENGINE. It accepts approved HTTPS publisher image hosts only, forwards no caller credentials, follows no redirects and bounds time/bytes. JPEG, PNG and WebP signatures must match their MIME type. A missing/blocked photo uses the brand card; draft/unknown stories never yield private metadata or images. Responses have short public caching; engine failures remain no-store. Static pages retain their page-specific metadata.

Validation: content, polish, system, explorer and investigation suites; bilingual HTMLRewriter sharing tests; image fallback/redirect/signature/size/credential tests; production Astro build; official Pages Functions bundle; actual compiled Pages routing test through the static fallback. Brand image inspected at 1200×630. Deployment/live verification follows separately.

Deployment is restricted to Pages for this change: preserve existing dashboard bindings and compatibility settings, engine, databases, R2 map layers and deployed geography bytes. Work stays on preview/investigative-explorer; no merge to main or full infrastructure workflow is required. Sharing services may cache older cards; existing messages cannot be refreshed by this application.

## Live release

Pages source: `8e9abe013bbbae4e2f9595b506caa2f2cfcabd99`, kept on `preview/investigative-explorer` (draft PR #14). Preview deployment `9a29fa12-565f-4258-bd5a-6679640635b7`; production deployment `60fb8917-fbcc-4e11-bc60-3bbb692dbd21`. Both succeeded. Dashboard WATCH_ENGINE, ARCHIVE and compatibility date 2026-08-29 are preserved.

Live crawler-style HTML checks passed for English/Indonesian story 1166, homepage and Indonesian News: exactly one canonical URL and one Open Graph photo, matching Twitter metadata, localized title/summary, HTTP 200 image with valid JPEG/PNG bytes. Story 1166 returns its 47,165-byte Suara Papua JPEG. Invalid/unknown stories and image IDs return 404. All three deployed silhouette/context/label GeoJSON files match the pre-release bytes. The compiled Pages router test reaches the static branded fallback through context.next(). These checks do not claim a messaging provider's cache was refreshed or a particular chat client was exercised.
