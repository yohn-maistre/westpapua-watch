# Watch Engine 08.6

Freeze 08.6 is a narrow reliability patch for the editorial loop.

## Why 08.5 stayed empty

The editorial queue and consumer were deployed correctly, but the writer failed before the critic. `critic_reviews = 0` isolated the failure to structured model output. The configured Gemma 4 26B A4B and Qwen3 30B A3B models are not on Cloudflare Workers AI's JSON Mode support list as of September 2026, so the engine must not depend on native `response_format` for those models.

## Structured-output strategy

`runJson()` now:

1. uses AI Gateway JSON output when a gateway is configured;
2. uses native Workers AI JSON Schema only for models on the documented JSON Mode support list;
3. otherwise prompts the selected model to return exactly one schema-matching JSON object;
4. strips fences and safely extracts one balanced top-level object;
5. performs one constrained JSON repair pass if parsing still fails;
6. throws a diagnostic error describing which structured-output stages failed.

The newsroom model choices do not change.

## Editorial telemetry

Migration `0004_editorial_observability.sql` adds `engine_attempts` with only operational metadata:

- Development ID
- stage (`writer`, `critic`, `finalize`)
- outcome (`started`, `success`, `error`)
- model
- concise error
- timestamp

No prompts, article bodies, questions, or source text are stored in this table.

`/health` and internal `/review/status` expose safe counts so an empty Current page can be diagnosed without tailing a queue blindly.

## Recovery

The migration resets V2 `editorial_queued`, `retrying`, and legacy `held` rows to `candidate` with `retry_count = 0`. The next normal Workflow run re-enqueues them through the corrected writer path.

A singleton Development can no longer loop forever solely because the critic marks `cluster_problem`; there is no cluster to split. A strong persisted relevance decision can likewise override a critic-only relevance disagreement. After six non-fatal synthesis revisions, a relevant story can degrade to the conservative attributed source brief.

## Shared topical tags

The provisional taxonomy introduced in 08.5 is now visible:

- Current displays shared topical chips, replacing the launch-only glossary chips when live content arrives.
- The fallback Raja Ampat fixture also uses shared topical chips, so the vocabulary is visible before the first live Development publishes.
- Resources display their shared tags as visible micro-chips and filter by the same tag slugs.

Persistent Issue definitions remain a separate research task.
