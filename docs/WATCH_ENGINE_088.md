# Watch Engine 08.8 — Git-managed AI Gateway routes

Freeze 08.8 makes the repository the source of truth for the three AI Gateway Dynamic Routes used by Watch Engine.

## Live policy

- `dynamic/watch-fast`: Google AI Studio `gemini-3.5-flash-lite`, then `gemini-3.6-flash`
- `dynamic/watch-synth`: Google AI Studio `gemini-3.7-flash`, then `gemini-3.6-flash`
- `dynamic/watch-ask`: Google AI Studio `gemini-3.7-flash`, then `gemini-3.6-flash`
- Direct Workers AI fallback is disabled by default with `ENABLE_WORKERS_AI_FALLBACK=false`.

The existing route IDs are reused. CI creates a new version for each named route and deploys it through Cloudflare's Dynamic Routing management API. Old GPT-4o/Llama template versions remain only as rollback history.

## Provider keys

The Google AI Studio key stays in AI Gateway Provider Keys (BYOK). Do not add the Google key to GitHub or Watch Engine secrets.

The Worker needs only `AI_GATEWAY_TOKEN`, already synchronized from GitHub Actions by the deployment workflow.

## Why no Workers AI fallback right now

Workers AI exhausted its daily free allocation during activation testing. Keeping the direct fallback disabled makes provider failures visible and prevents a depleted local fallback from masking the actual Gateway state. Re-enable it later by setting `ENABLE_WORKERS_AI_FALLBACK=true` in the Worker configuration.

## Deployment order

1. Render Watch Engine config.
2. Deploy/update AI Gateway route versions.
3. Apply D1 migrations, including the one-time editorial recovery reset.
4. Deploy Watch Engine.
5. Synchronize `AI_GATEWAY_TOKEN`.
6. Deploy Pages.

If route deployment fails, CI fails before resetting editorial jobs.
