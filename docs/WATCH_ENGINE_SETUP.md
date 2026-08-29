# Watch Engine setup

This bootstrap keeps the Astro publication static and makes the intelligence layer a separate private Worker. Pages calls it through a Cloudflare Service Binding named `WATCH_ENGINE`. Until that binding exists, the site keeps its static Current content and the existing Ask fallback.

## 1. Create the Cloudflare resources once

Run these from the repository with the same Cloudflare account/token used for deployment:

```bash
npx wrangler d1 create westpapua-watch-db
npx wrangler r2 bucket create westpapua-watch-archive
npx wrangler vectorize create westpapua-watch-articles --dimensions=1024 --metric=cosine
npx wrangler queues create westpapua-watch-ingest
npx wrangler queues create westpapua-watch-ingest-dlq
```

`@cf/baai/bge-m3` produces 1024-dimensional embeddings in Cloudflare's current model catalog, so do not create the Vectorize index with the old 768-dimensional tutorial value.

Copy the D1 `database_id` printed by Wrangler.

## 2. Add one GitHub repository variable

GitHub → repository → Settings → Secrets and variables → Actions → **Variables**:

- `WATCH_DB_ID=<the D1 database UUID>`

This is an identifier, not a credential. Keep the existing `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as Secrets.

Once `WATCH_DB_ID` exists, the existing deployment workflow will render the Worker config, apply D1 migrations, deploy the private Worker, then deploy Pages.

## 3. Add the Pages → Worker service binding

After the first Worker deploy:

Cloudflare → Workers & Pages → **westpapua-watch** → Settings → Bindings → Add → **Service binding**

- Variable name: `WATCH_ENGINE`
- Service: `westpapua-watch-engine`

Redeploy Pages once after adding the binding.

The Worker has `workers_dev: false`, so the Watch Engine is not intended to expose a public workers.dev endpoint. Pages invokes it internally.

## 4. First ingestion cycle

The Workflow is scheduled every 30 minutes. Initially only three source adapters are enabled:

- Jubi
- Aneta Papua
- Mongabay Indonesia

The cycle discovers candidate URLs and sends them to `westpapua-watch-ingest`. The Queue consumer then:

1. fetches and normalizes the article;
2. rejects mixed-source articles with no Papua relevance;
3. stores metadata in D1 and normalized text in R2;
4. records the lead image URL/credit as an image candidate without copying it;
5. generates a BGE-M3 embedding;
6. upserts the vector into Vectorize;
7. retrieves recent semantic neighbors;
8. uses a narrow LLM same-event verifier before merging;
9. creates/updates a Development candidate;
10. proposes durable Resource candidates separately.

You can manually trigger the Workflow through the service once we add the review surface, or through Wrangler/Cloudflare Workflows tooling.

## 5. Publishing mode

The default is deliberately:

```json
"AUTO_PUBLISH": "false"
```

Clusters become `candidate` developments until reviewed. After the first few source cycles look sane, change it to `true` if you want multi-source (2+ distinct publishers) developments to become public automatically.

`/api/current` on Pages reads only `published` developments, with the existing Astro content as fallback.

## 6. Images

The extractor stores:

- candidate image URL;
- source page;
- extracted credit/caption when present;
- rights state.

It does **not** copy third-party news images into R2 automatically. The default `ALLOW_EXTERNAL_IMAGES=false` means Current keeps the Signal fallback unless an image candidate is marked `approved`.

If campaign/partner material is approved, set `rights_status='approved'` for that image candidate. A later review UI will make this a button instead of SQL.

## 7. AI Gateway (optional but recommended)

The Worker runs fully on Workers AI without Gateway configuration. To make model/provider routing replaceable, create an AI Gateway and dynamic routes such as:

- `dynamic/watch-fast` — cheap extraction/verifier route
- `dynamic/watch-ask` — answer route with fallbacks

Then set Worker secrets/variables:

```bash
npx wrangler secret put AI_GATEWAY_TOKEN --config services/watch-engine/wrangler.generated.jsonc
```

Add `AI_GATEWAY_BASE` as a Worker variable in Cloudflare, for example the Gateway OpenAI-compatible `/compat` base URL. Store third-party provider keys in AI Gateway BYOK, not in browser code.

The Worker sends `cf-aig-collect-log-payload: false` so prompt/response bodies are not intentionally collected in AI Gateway logs.

## 8. Browser Run

The first deployment intentionally does **not** require a Browser Run binding. The enabled adapters prefer RSS/Atom and ordinary fetch, which keeps setup and cost smaller. When a specific publisher proves impossible to ingest without rendered DOM, add a `BROWSER` binding to the Worker config and a source-specific Browser Run fallback instead of making every source pay the Chromium tax.

## 9. Next operational surface

The Worker already exposes an internal `/review/candidates` response. The next small admin feature should sit behind Cloudflare Access and support:

- merge / split;
- assign issue;
- edit generated title/summary;
- approve image;
- publish / retract.

Do not put unpublished testimony or sensitive source identities in this public repository or the generic ingestion database.
