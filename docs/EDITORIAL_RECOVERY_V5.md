# Editorial recovery and map polish — 10 September 2026

Baseline: upstream `8614e7af918d94877d4e05531d4feb8f9b9494b2`. Preserve Hermes's operator telemetry and the existing publication gate.

## Diagnosis and change

The supplied Hermes diagnostic records successful ingestion and critic HTTP 400 failures on `dynamic/watch-fast`. It does not establish the exact rejected argument or serving provider. Google documents that `reasoning_effort: "none"` cannot disable reasoning on Gemini 3 models. The application sent that option on the critic path, along with provider-native strict JSON Schema.

Dynamic Gateway requests now omit both options. Structured calls put the schema in the instruction and validate the returned structure locally, including nested required fields, types and enums. Missing or invalid reviews still hold publication. Each operation still makes at most one Gateway request; configured Gateway providers own fallback. No application-level `watch-fast → watch-synth` retry is added. This supersedes the contrary retry statement in WATCH_ENGINE_089.md.

The critic has a separate optional `AI_GATEWAY_CRITIC_MODEL` setting; without it, the current fast route remains in use. Rejected calls log serving provider/model/step headers when supplied. Existing telemetry and backoff remain intact. No held records are forced to publish, and no editorial decisions are cleared.

## Model status and controlled checks

Checked 10 September 2026:

| Model | Published availability | Account-level test |
| --- | --- | --- |
| `minimax/minimax-m3:free` | OpenRouter lists zero token pricing, rate limited | Not run here |
| `gemini-3.5-flash-lite` | Google lists a free standard tier; paid projects have separate pricing | Not run here |
| `qwen/qwen3.8-27b` on Groq | Existing configured first provider; current account access not independently established | Not run here |

Sources: [OpenRouter model page](https://openrouter.ai/minimax/minimax-m3:free), [Google pricing](https://ai.google.dev/gemini-api/docs/pricing), [Google compatibility](https://ai.google.dev/gemini-api/docs/openai).

Do not infer editorial quality from model size or a free listing. Route fallback means a successful route is not proof that its first provider worked. Inspect the serving model/provider output. Do not remove `:free` or switch to a paid endpoint to rescue a failed probe. A Google free tier listing does not force an already billed project to use that tier.

With Gateway credentials supplied privately through environment variables:

```sh
node scripts/probe-critic.mjs dynamic/watch-fast
node scripts/probe-critic.mjs dynamic/watch-synth
```

Each command makes three bounded synthetic review calls using the production critic instruction and schema. It checks an attributed promise, an unsupported completion claim and an invented contract. It performs no database, queue or publishing writes. Failure output excludes raw provider bodies and secrets. This is a compatibility smoke test, not a bilingual editorial benchmark. Keep the existing model order until actual results justify changing it.

## Deployment and recovery

Deploy both Pages and Watch Engine. Apply migration 0017 for optional Library metadata and the two added topic records before the Worker deployment. The static language route moves from `/pmy/` to `/id/`; the edge story middleware moves too. Legacy paths redirect with 308 while retaining query strings. Internal `pmy` content keys remain for the separate translation pass. Ask accepts both locale values.

After deployment, collect operator review status, invoke one normal cycle, then inspect status after the queued work has completed. Existing provider holds have a not-before backoff; a cycle before that deadline may legitimately do no editorial work. Verify a new successful critic review and publication timestamp, not merely increased article counts or a successful workflow trigger. If 400s persist, compare serving-provider metadata and the active Gateway dashboard configuration against the repository route files. No forced database reset is part of this patch.

## Map and Markdown

- Current/Sekarang is the default preset: stories, settlements, boundaries and available fire detections. Legacy Overview links resolve to it.
- Environment retains environmental layers; the duplicate Climate preset is removed, while rainfall remains available in Layers. Legacy Climate links resolve to Environment and explicit layer selections remain intact.
- Layers and Expand use labelled icons on narrow maps and sit beside the base switch. The active preset is omitted from its own menu; it remains visible in the menu summary.
- Water permanence adds JRC's 1984–2024 occurrence tile layer. Pink to blue indicates occasional to persistent observed water. This is historical context, not a flood warning. [JRC service, attribution and update caveats](https://global-surface-water.appspot.com/download). Tile rendering could not be verified from this environment; retain it as an optional layer and check it in the deployed browser.
- Numbered answers preserve numbering across blank lines and explanatory paragraphs, with new headings starting a new sequence. Indented paragraphs remain within list items. Source HTML stays inert.

## Verification limits

Content checks, the 68-page static build, regression assertions and Worker/Pages compilation were checked locally. Regression cases cover nested malformed critic output, omission of provider-specific parameters, one-request behavior, Markdown numbering and injection safety, ID redirects and map aliases. No live Gateway credential test, production recovery or browser screenshot verification was possible here.
