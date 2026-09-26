# Event Scout — implementation note

This bundle deliberately keeps event publication on the existing reviewed `content/events.json` path while simplifying the public Events UI. The next engine addition should be a candidate-only Event Scout, not an auto-publisher.

## Discovery order

1. iCalendar / ICS feeds
2. RSS / Atom entries with event links
3. `schema.org/Event` JSON-LD
4. deterministic HTML metadata and dates
5. ordinary crawl of sitemaps and event/calendar pages
6. Browser Rendering only for JavaScript-only pages

The source graph should begin with Watch's existing organizations and news sources, then follow explicit event/venue/organizer links into a bounded candidate frontier. News ingestion may nominate future public events it encounters. Search APIs are optional discovery aids rather than a production dependency.

## Candidate contract

Each candidate should retain canonical URL, discovery URL, organizer, venue/place, local date/time/timezone, source type, first-seen/last-checked timestamps, and all alternate source URLs. Deduplication should use normalized title + local calendar date + normalized venue/organizer, with URLs as aliases.

No candidate should publish automatically until the review path, timezone handling, cancellation/update behavior, and source-provenance UI are in place. This keeps the current calendar reliable while allowing the crawler to evolve independently of NewsCycleWorkflow.
