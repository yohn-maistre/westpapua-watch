# Library research pass — 10 September 2026

The supplied bundle contains 372 Library candidates and 68 exhibition candidates. Preserve the original candidate JSON and research notes. These are supplied bibliographic findings, not proof that Watch has accessed every full work.

322 candidates enter the catalogue. 50 remain in the review pool: 25 missing URLs, 19 needing a work-specific link, 4 bibliographic leads, and 2 conflicting DOI records. With the existing collection and one exact title/DOI duplicate merged, the static catalogue contains 357 works. Different chapters or films sharing an external collection URL remain separate records.

## Shared model

`shared/library.ts` drives static records, live API normalization and retrieval. Publisher provenance, item type, evidence role, broad topics, Following relationships, places and format stay separate. Bibliographic fields include authors, publication date, DOI/ISBN, access, alternate URLs and visual attribution. Publication year never comes from discovery time. Unknown languages remain unknown.

Existing topic IDs remain stable; History & decolonisation and Society, culture & religion are added. Following is a separate facet. Detailed supplied lanes are searchable tags. We deliberately avoid replacing the established topic system with a second competing shelf taxonomy.

`shared/research.ts` handles import rules and preserves supplied verification status separately from verification performed here. Search can find catalogue descriptions, authors and identifiers; this is not full-text indexing. Ask must continue identifying catalogue metadata as metadata and must not attribute unread arguments to a work.

## Interface

Compact cover tiles use HTTPS source images with category-colour fallbacks. They do not invent book covers. Topics, Following, type, place and language filter the same records. Active chips can be removed; Reset appears only when needed. Show more reveals 36 records at a time. Export downloads all matching records, including matches beyond the currently visible page.

The shared collection feeds topic and Following pages, Library JSON, live resource merging and site retrieval. D1 migration 0017 adds optional metadata JSON without requiring existing ingest writes to populate it. The supplied corpus remains versioned static data merged into the API; it is not copied into D1 as hundreds of duplicate rows.

## Exhibition and images

All 68 supplied candidates remain in `content/research/exhibition-candidates.json`. Six concrete entries replace generic placeholders: Hidden Faces of Papua, Bihm, Udeido Collective, Koreri Projection, PESTA BABI and Our Land Has Gone. Five use remote source images; the last uses an explicitly credited abstract catalogue tile. Credits appear in the index and focus dialog. External image availability and reuse terms require ongoing review; attribution is not a claim of an open licence.

Sources checked for metadata and image locations:
- https://peacebrigades.nl/en/news/hidden-faces-papua-exhibition-udeido-collective
- https://lahorebiennale.org/lb03-artists/udeido-collective-dicky-takndare/
- https://www.youtube.com/watch?v=MpdrWgDRVf8
- https://www.lifemosaic.net/eng/resources/video/our-land-has-gone
- https://oneworld-publications.com/work/an-act-of-free-choice/
- https://bookshop.iseas.edu.sg/publication/428

## Validation and limits

Run `npm run check:content`, `npm run check:polish`, `npm run check:system`, `node scripts/tests/research.mjs` and `npm run build`. The import test checks all 372 identities, exclusions, DOI conflict handling and shared-URL identity. The live critic probe still requires the operator's Gateway credentials. Browser/device screenshot QA and exhaustive external-link/full-text verification were not available in this environment. The research backlog is preserved, not silently promoted to verified published content.
