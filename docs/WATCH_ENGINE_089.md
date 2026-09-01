# Watch Engine 08.9 — Finish-line recovery

Freeze 08.9 fixes the two blockers after Gemini synthesis began succeeding.

## Critic path

`watch-fast` now uses:

1. Google AI Studio `gemini-3.6-flash`
2. Google AI Studio `gemini-3.7-flash`

The OpenAI-compatible Dynamic Route call no longer depends on provider-specific
`response_format`. The existing strict JSON instruction, parser, and repair path
remain responsible for structured output.

If the fast critic route still fails, the critic retries through `watch-synth`
before the queue job fails.

## Publication no longer depends on embedding quota

Previously `finalize()` embedded and indexed the Development before updating D1
to `published`. Because BGE-M3 uses the Workers AI allocation, an exhausted
embedding quota could block publication even after writer and critic succeeded.

08.9 makes D1 publication authoritative:

1. save synthesis
2. rank
3. update Development to `published`
4. attempt Development Vectorize indexing best-effort
5. write Issue delta best-effort

A vector-index failure is logged as `vector-index/error`, but does not unpublish
or fail an otherwise reviewed Development.

Do not mix Gemini embedding vectors into the existing BGE-M3 Vectorize index.
A future embedding-provider migration must rebuild/re-embed the index coherently.
