# Watch Engine 08.7 — AI Gateway activation

Freeze 08.7 wires the already-existing provider abstraction to the deployed Worker.

## What was missing

The Watch Engine code already preferred `AI_GATEWAY_BASE + AI_GATEWAY_TOKEN`, but:

1. `AI_GATEWAY_BASE` was not rendered into the Worker vars.
2. the GitHub Actions `AI_GATEWAY_TOKEN` repository secret was never copied into the Worker secret store.

Therefore the live Worker always fell back to direct Workers AI.

## Dynamic-route contract

The Worker calls these route names through AI Gateway's `/compat/chat/completions` endpoint:

- `dynamic/watch-fast`
- `dynamic/watch-synth`
- `dynamic/watch-ask`

The route graph itself lives in Cloudflare AI Gateway, not in the repository. Code selects the logical route; the dashboard controls provider/model/fallback nodes.

Recommended initial route versions:

### watch-fast

1. Google AI Studio — `gemini-3.5-flash-lite`
2. optional fallback: Google AI Studio — `gemini-3.6-flash`
3. optional final route fallback: Workers AI — `@cf/qwen/qwen3-30b-a3b-fp8`

### watch-synth

1. Google AI Studio — `gemini-3.7-flash`
2. optional fallback: Google AI Studio — `gemini-3.6-flash`
3. optional final route fallback: Workers AI — `@cf/google/gemma-4-26b-a4b-it`

### watch-ask

1. Google AI Studio — `gemini-3.7-flash`
2. optional fallback: Google AI Studio — `gemini-3.6-flash`
3. optional final route fallback: Workers AI — `@cf/google/gemma-4-26b-a4b-it`

The application itself still falls back to direct Workers AI if the AI Gateway request fails completely.

## Required Cloudflare/GitHub state

- AI Gateway id: `westpapua-watch`
- gateway authentication enabled
- Google AI Studio provider key stored through AI Gateway BYOK
- dynamic routes saved **and deployed**
- GitHub Actions repository secret: `AI_GATEWAY_TOKEN`

The deployment workflow now renders:

`https://gateway.ai.cloudflare.com/v1/<account-id>/westpapua-watch/compat`

from the existing `CLOUDFLARE_ACCOUNT_ID` secret and synchronizes `AI_GATEWAY_TOKEN` into the Worker with `wrangler secret put`.

## Recovery

Migration `0005_gateway_recovery.sql` resets V2 editorial rows stuck while Workers AI quota was exhausted back to `candidate` with retry counter zero. The next normal Workflow cycle re-enqueues them.

Do not manually delete raw articles or story packets.
