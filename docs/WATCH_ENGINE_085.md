# Watch Engine 08.5

Freeze 08.5 is an operational bridge between the 08 intelligence loop and the later persistent-issue taxonomy pass.

## Editorial isolation

Ingestion and editorial synthesis now use separate Cloudflare Queues.

- `westpapua-watch-ingest`: extraction, relevance, Story Packet, embedding and clustering.
- `westpapua-watch-editorial`: one Development per message, writer + critic, then requeue on a logical revision.

The editorial consumer uses batch size 1 and max concurrency 1. A single difficult Development therefore cannot block source discovery or ingestion.

A Development is revised across durable queue turns. Infrastructure/model failures use native Queue retry. Logical critic revisions enqueue the Development again. After six non-geography/non-cluster revisions, the engine publishes a conservative directly-attributed source brief rather than losing relevant reporting. Unresolved geography is never fallback-published.

Published Developments remain public while a newer synthesis is being revised.

## Workflow

The 30-minute Workflow is a conductor only:

1. discover publishers;
2. enqueue fresh articles;
3. enqueue legacy singleton reprocessing;
4. enqueue the editorial backlog;
5. reconcile a small set of recent Development candidates;
6. check emerging-issue candidates.

It no longer performs twelve sequential writer/critic loops inside one Workflow step.

## Taxonomy foundation

`content/taxonomy.json` introduces a provisional shared topical vocabulary for Current, Issues and Resources. It is deliberately not the final persistent-issue ontology.

Resources now filter by subject tags while retaining document type as row metadata.

A later research pass should define persistent Issues as specific structural storylines, with the broad taxonomy used as eyebrows/tags rather than as the Issue titles themselves.
