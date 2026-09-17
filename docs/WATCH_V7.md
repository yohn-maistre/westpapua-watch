# Watch v7 — publication recovery and the Resources / Data correction

This patch is based on deployed main `af597e95eee69bcb40899eceb910b29f4cf9d7f9`. It supplements v6; it does not replay the earlier Library import.

## What ships

- Resources navigation and page title. A searchable, categorized mosaic of 39 sites and organizations sits above the existing Library. Tiles reuse Watch's restrained gradients and contour texture, carry descriptions, and link directly to each external destination. Matching Library counts are secondary links; zero-count links are hidden. BBC News Indonesia is included from the existing source registry.
- Data becomes an actual on-site presentation: 2026 Otsus allocation/transfer comparisons, six provincial 2024 APBD expenditure profiles, a 58-location SPPG map and address/status table, a BPS 2023–2024 human-development comparison, and a short sourced Otsus law explanation. Supporting records remain available in a collapsed section.
- All six province pages contain 12 sourced observations each. The same records feed JSON downloads and Ask retrieval. APBD and BPS dataset detail pages contain their figures instead of only external links.
- Exhibition desktop uses three contained columns with restrained hover emphasis. Source-only catalogue entries remain in the catalogue; the moving wall uses visual entries. Gallery controls are numbered because columns contain mixed forms. Mobile movement, pause, focus dialog, and reduced-motion support remain.
- The masthead grid accommodates the eighth navigation item; mobile navigation scrolls as one row.

## Publication recovery

The supplied Hermes report establishes healthy ingestion and lease release, but writer failure before critic review. Queue concurrency was already one. Serial calls can still exceed a shared output-token quota.

1. Editorial messages in a dispatch wave are spaced by 180 seconds. An atomic D1 pacing slot prevents simultaneous/rapid editorial starts across waves. A denied slot releases its development for a later cycle without calling a model.
2. Ordinary writer output is a short bilingual headline/summary contract (600-token ceiling); critic output is capped at 350. Combined requested completion capacity is 950 tokens per normal job. Other account traffic and provider accounting still affect quota; this is not a quota guarantee.
3. Structured prompts use one consolidated system message, with the JSON contract last. Empty or incomplete required strings fail validation. Parsing does not fill absent translated fields with invented values.
4. The normal route is Gemini-first, then Qwen on transport/provider fallback. After quota or malformed output, a later scheduled attempt uses Qwen-first `dynamic/watch-synth-alt`, alternating on further failures. A malformed HTTP 200 therefore no longer traps every retry on the same preferred provider. There is no immediate model repair loop.
5. On writer failure, eligible developments can publish a short literal excerpt from a member article's publisher summary. Eligibility requires recent, high-confidence relevant reporting, a qualifying original local report, and no prior critic review. The entire cluster must have high-confidence relevance. HTML/promotional-looking summaries are rejected.
6. These are labelled `source_excerpt`, include the publisher and original-language notice, and link to the excerpt's original article. They create neither a synthesis row nor a critic pass. Existing publications and editorial rejections are not replaced by this fallback. The pending synthesis remains scheduled with backoff.
7. A later valid writer output still goes through the critic. A passing review replaces the excerpt with a reviewed bilingual synthesis. The translation-repair finalization call now passes its dispatch token correctly.

The fallback is deliberately bounded. It does not guarantee every backlog item will publish. Old, low-confidence, unsupported, or previously reviewed/rejected material remains held. No mass replay of held records is included.

## Models and evidence

Checked 17 September 2026:

- Google documents `gemini-3.5-flash-lite`: https://ai.google.dev/gemini-api/docs/models
- Groq lists `qwen/qwen3.8-27b` as a preview model: https://console.groq.com/docs/models
- OpenRouter's public catalogue lists paid `minimax/minimax-m3`; the earlier `minimax/minimax-m3:free` alias was not confirmed: https://openrouter.ai/api/v1/models

The unverified free alias is removed from the three default routes. This patch does not switch to paid MiniMax. Account-specific free quota, provider permissions, and gateway behavior need Hermes' production verification. Public model listings do not prove that a particular account can make a successful call.

## Data provenance and limits

| Module | Period / snapshot | Source and scope |
| --- | --- | --- |
| Otsus | Fiscal 2026; source labels itself 18 September 2026 | DJPK SIKD CakLur national TKD table, province-labelled accounts. Source date is preserved verbatim. General + earmarked form the headline total; infrastructure is separate. Transfers are not expenditure. |
| APBD | 2024, period 12; snapshot retrieved 3 July 2026 | DJPK snapshot in the user's Detak Detik repository. Provincial government spending only. Population and national ranks were removed because they are different measures/periods. |
| SPPG / MBG | Repository snapshot 1 July 2026 | Detak Detik's public SismonBGN points, filtered to Papua addresses and Papua bounds. All 58 are pending or not yet operating. This is neither a current census nor evidence of delivered meals. |
| Human development | 2023–2024 | BPS *Indikator Penting Provinsi Papua Tengah*, February 2025, appendix 4, printed page 63. Comparable six-province series; not the newest release. |
| Law | UU 2/2021, enacted 19 July 2021 | JDIH BPK's law/amendment record. |

Source URLs and dates are in `content/data/*.json` and on the page. Detak Detik's explicitly illustrative `newsroom/data/papua.json` was excluded. There are no fabricated observations, politician affiliations, population estimates, or claimed operational SPPG points.

These are versioned snapshots, not automated live feeds. Add refresh adapters behind the same observation contract next. Full politician/party relationship profiles and nationwide programme monitoring are not populated in this pass. The existing record model supports sourced relationships, but membership, support coalitions, employment and ownership must remain distinct dated predicates.

## Verification completed locally

- Astro production build: 328 pages.
- `check:content`, `check:system`, `check:polish`, `scripts/tests/research.mjs` and `scripts/tests/recovery.mjs`.
- New `scripts/tests/v7.mjs`: atomic pacing; original-summary-only excerpt; confidence/HTML/lease protection; publication flag; real SQLite migration execution; malformed writer -> excerpt -> alternate route -> critic-approved replacement; source/period-bearing Ask retrieval; six-province observations and MBG status integrity.
- Worker esbuild bundle and Cloudflare Pages Functions compilation.
- Patch whitespace and apply checks.

The model responses in the recovery test are fixtures, not production calls. No deployment or production cycle was run here. Chromium was unavailable in this runtime, so browser screenshot/layout verification is outstanding; do not represent the desktop/mobile layout as visually certified. Check 390px, 768px and 1440px after deployment, especially map attribution, navigation overflow, Library filtering and exhibition lanes.
