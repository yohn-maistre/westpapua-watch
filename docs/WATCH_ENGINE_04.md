# Watch Engine 04

This patch turns the current static publication into a Cloudflare-native ingestion, clustering and retrieval stack while keeping the public site readable if the engine is unavailable.

## Cloudflare resources

Create once:

```bash
npx wrangler d1 create westpapua-watch-db
npx wrangler r2 bucket create westpapua-watch-archive
npx wrangler vectorize create westpapua-watch-articles --dimensions=1024 --metric=cosine
npx wrangler queues create westpapua-watch-ingest
npx wrangler queues create westpapua-watch-ingest-dlq
```

Add the D1 UUID as a GitHub Actions repository **variable**:

```text
WATCH_DB_ID=<database UUID>
```

Keep these as GitHub Actions **secrets**:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

The existing deploy workflow will render the Worker config, apply migrations, deploy the Watch Engine, then deploy Pages.

## Pages service binding

After the first Watch Engine deploy, add a Pages service binding:

```text
Variable: WATCH_ENGINE
Service: westpapua-watch-engine
```

Redeploy Pages, then visit:

```text
/api/engine-health
```

The response should report the D1, R2, Vectorize, Workers AI, Browser Run, Queue and Workflow bindings as available.

## Ingestion path

Every 30 minutes the Workflow discovers enabled publishers and queues new URLs. The consumer then runs:

1. ordinary HTTP fetch;
2. Defuddle + Mozilla Readability extraction;
3. Browser Run rendered HTML fallback;
4. optional Firecrawl fallback;
5. article normalization + content hash;
6. Story Packet extraction with Workers AI;
7. BGE-M3 embedding + Vectorize upsert;
8. multi-signal same-event clustering;
9. development synthesis;
10. issue-delta proposal;
11. durable-resource proposal.

Exact-content syndication is recorded so copied releases do not silently become independent corroboration.

## First run

The Workflow will run on its schedule. To trigger it manually:

```bash
npx wrangler workflows trigger westpapua-watch-news-cycle \
  '{"reason":"first-run"}' \
  --config services/watch-engine/wrangler.generated.jsonc
```

Inspect candidates:

```bash
npx wrangler d1 execute DB --remote \
  --config services/watch-engine/wrangler.generated.jsonc \
  --command "SELECT id,issue_slug,status,title_en,updated_at FROM developments ORDER BY updated_at DESC LIMIT 30;"
```

Publish a reviewed development:

```bash
npx wrangler d1 execute DB --remote \
  --config services/watch-engine/wrangler.generated.jsonc \
  --command "UPDATE developments SET status='published' WHERE id=<ID>;"
```

Published developments appear through `/api/current`, `/story/?id=<ID>` and Ask.

Resource candidates remain separate from news. After review:

```bash
npx wrangler d1 execute DB --remote \
  --config services/watch-engine/wrangler.generated.jsonc \
  --command "UPDATE resource_candidates SET status='published', updated_at=datetime('now') WHERE id=<ID>;"
```

Published resources appear through `/api/resources` and are appended to the Resources page without a rebuild.

## Images

The pipeline records the lead image URL, source page, caption and credit when available. External images are enabled for the public Current response and always retain a source link. If a remote image fails, the site's existing Signal image remains the fallback.

Do not silently re-host third-party images in R2. Partner/campaign assets can be copied into the site separately when permission or ownership is clear.

## Optional Firecrawl

Nothing is required for the default pipeline. To activate Firecrawl as the final extraction fallback, add a Worker secret:

```bash
npx wrangler secret put FIRECRAWL_API_KEY \
  --config services/watch-engine/wrangler.generated.jsonc
```

The integration uses Firecrawl v2 `/scrape` only after ordinary fetch and Browser Run fail.

## Optional AI Gateway

Workers AI is the default and requires no extra provider secret. For dynamic provider routing, set:

```text
AI_GATEWAY_BASE=https://gateway.ai.cloudflare.com/v1/<ACCOUNT_ID>/<GATEWAY_ID>/compat
AI_GATEWAY_TOKEN=<gateway auth token>
```

Keep `AI_GATEWAY_TOKEN` as a Worker secret. The code calls dynamic routes `dynamic/watch-fast` and `dynamic/watch-ask` and sends `cf-aig-collect-log-payload: false`.

## Publishing policy

`AUTO_PUBLISH` stays `false` for launch. Observe several cycles first. If it is later enabled, the engine only auto-publishes a synthesized development after at least two distinct non-syndicated publishers whose provenance roles are not `state_media`, `official_record` or `state_public_media`.

Public/state/official sources can still contribute information and are retained with explicit provenance; they simply cannot satisfy the independent-source threshold by themselves.

## Security notes

- The Watch Engine uses `workers_dev: false` and is intended to be reached through the Pages service binding.
- Public development lookup returns only `published` developments.
- Candidate/review endpoints exist only on the internal Worker.
- Pages Ask validates origin, body size and its rate brake before forwarding to the engine.
- Put durable rate limiting on `/api/ask` in Cloudflare WAF/Rate Limiting before a larger launch.
- Do not ingest private testimony, unpublished identities or sensitive source material into this generic public-news database.
