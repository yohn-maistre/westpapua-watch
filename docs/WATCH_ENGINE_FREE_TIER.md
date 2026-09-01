# Watch Engine free-tier runtime

Freeze 05 keeps the durable `NewsCycleWorkflow` but moves scheduling to a normal Workers Cron Trigger. Native Workflow `schedules` require Workers Paid; Cron Triggers are available on Workers Free.

## Runtime

- Cron Trigger: `11,41 * * * *` (UTC), two runs per hour.
- `scheduled()` creates one durable `westpapua-watch-news-cycle` Workflow instance per half-hour slot.
- The Workflow still performs discovery, deduplication and Queue fan-out. Queue consumers still perform extraction, story packets, embeddings, clustering and synthesis.
- `AUTO_PUBLISH` remains `false`.

## Default models

- Embeddings: `@cf/baai/bge-m3`
- Pipeline / structured extraction / event verification / synthesis: `@cf/qwen/qwen3-30b-a3b-fp8`
- Ask: `@cf/google/gemma-4-26b-a4b-it`

These are fallback models when AI Gateway is not configured.

## Provider switching with AI Gateway

The code already checks AI Gateway before calling Workers AI directly. Configure these Worker values later:

- `AI_GATEWAY_BASE=https://gateway.ai.cloudflare.com/v1/<ACCOUNT_ID>/<GATEWAY_ID>/compat`
- secret `AI_GATEWAY_TOKEN`
- `AI_GATEWAY_FAST_MODEL=dynamic/watch-fast`
- `AI_GATEWAY_ASK_MODEL=dynamic/watch-ask`

That means provider changes do not require an application code change. A dynamic route can point the fast pipeline at Google AI Studio / Gemini, Groq, Workers AI, or another supported provider while Ask uses a separate route.

For Google AI Studio, prefer storing the Google API key in AI Gateway rather than placing it in the browser or public Pages variables. Public-source ingestion is a reasonable place to use a free Google AI API tier; reader Ask prompts should stay on the private Workers AI route unless the data-use policy is acceptable for that traffic.

## First deploy

1. Push this patch.
2. The Watch Engine deploy should no longer fail on paid Workflow scheduling.
3. Add the Pages service binding `WATCH_ENGINE -> westpapua-watch-engine` if it is not already present.
4. Redeploy Pages.
5. Check `/api/engine-health`; `scheduler.mode` should be `cron-trigger`.
6. Trigger one manual cycle through the existing `/run` route or Wrangler Workflow command, then inspect D1 / Queue / Workflow logs.
7. Leave `AUTO_PUBLISH=false` until clusters have been reviewed.

The Cron expression is UTC. `11,41 * * * *` intentionally avoids the top and half-hour boundaries while still running twice per hour.
