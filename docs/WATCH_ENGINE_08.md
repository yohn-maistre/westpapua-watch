# Watch Engine 08 — correlation loop

Freeze 08 changes the newsroom from one-shot article assignment into a repairable, multi-scale correlation loop.

## Editorial states

Relevant material must not disappear into a permanent review state.

- `published`: public Development.
- `retrying`: relevant Development whose synthesis/critic loop needs another cycle.
- `filtered`: off-desk material that does not materially concern West Papua / the western half of New Guinea.
- `merged`: a Development reconciled into another Development.

Legacy `held` rows are accepted by the repair query so Freeze 07 backlog can recover, but new editorial failures should use `retrying`.

## Language policy

Automated newsroom copy is generated in:

- English (`title_en`, `summary_en`)
- Bahasa Indonesia (`title_id`, `summary_id`)

The engine does **not** automatically generate Papuan Malay. On the PMY route, live newsroom material uses Bahasa Indonesia when no human-authored Papuan Malay override exists. Curated site copy can continue to use human-edited PMY.

## Relevance

For mixed publishers, broad article-body keyword matches are no longer hard passes. The Story Packet records:

- relevance decision
- confidence
- explanation
- evidence places/terms
- desk/category

The title, dek/description, extracted places, structured packet, and model decision carry more weight than incidental body text.

## Development clustering

Vectorize is recall, not the final editor.

1. BGE-M3 embeds each Story Packet.
2. The same Vectorize index also stores Development event signatures under IDs such as `dev:42`.
3. A new article retrieves candidate Developments.
4. A structured LLM adjudicator labels the relation as:
   - `same_event`
   - `same_issue_different_event`
   - `related_context`
   - `unrelated`
5. Only `same_event` joins the Development.
6. A reconciliation pass revisits recent small/singleton Developments and can merge missed matches.

The event signature is intentionally narrower than the article body: event/change, places, organizations and topics.

## Writer → critic → repair

For every relevant Development:

1. Writer produces EN + ID event-level synthesis.
2. Critic checks evidence support, attribution, geography, headline overclaiming, syndication and cluster coherence.
3. Material writing problems are fed back to the writer.
4. Bad multi-source clusters are split and re-evaluated.
5. Off-desk singletons are filtered.
6. If a valid story still cannot pass in the current execution, it becomes `retrying` and is revisited by the next Workflow cycle.

There is no model self-confidence threshold that can silently sentence a valid story to permanent `held` status.

Critic reports are stored in `critic_reviews` for diagnostics.

## Ranking

Published Developments receive a ranking score based on:

- freshness
- independent source diversity
- report count
- presence of Papuan/local reporting

Current sorts by this score, then recency. Clustering and ranking remain separate concerns.

## Emerging issues

`emerging_issues` is a dynamic layer below the future researched persistent-Issue taxonomy.

A candidate needs, at minimum:

- at least three distinct published Developments
- continuity over at least 14 days
- at least two distinct publisher origins
- strong semantic proximity in Development-vector space
- a structured LLM judgment that these are one recurring real-world storyline rather than a broad theme

Emerging items are explicitly labeled `Emerging` in the UI. They are not treated as permanent structural categories.

## Legacy backlog

Freeze 07 produced many singleton candidate/held Developments, including known off-desk material. Freeze 08 does not delete raw articles. Each Workflow cycle selects up to 12 legacy singleton derived Developments, removes only their old derived membership/Development row, resets the underlying article to `normalized`, and requeues it through relevance + clustering v2.

This preserves reporting provenance while allowing the editorial interpretation layer to be recomputed.

## First activation after deploy

Do not run several Workflows concurrently. Trigger one, let its queue drain, inspect Current/critic diagnostics, then trigger the next if you want to accelerate backlog reprocessing.

Useful public endpoints:

- `/api/engine-health`
- `/api/current`
- `/api/issues`
- `/api/emerging-issues`

Useful internal Worker endpoint:

- `/review/critic`

The existing 30-minute Cron Trigger continues normal operation after the activation pass.
