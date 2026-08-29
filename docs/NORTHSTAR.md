# West Papua Watch — Northstar

**Status:** working direction, not a frozen specification  
**Date:** 2026-08-28  
**Working name:** West Papua Watch

> Names, routes, labels, and section boundaries in this document are working terms. Keep them plain and literal while designing, but do not treat them as permanent product taxonomy until the content proves they work.

## 1. What this site is

A durable public resource for understanding what is happening in West Papua, the longer-running issues behind current developments, the history that gives them context, the sources that support the record, and the events and exhibitions connected to current campaigns.

It should work in two time scales at once:

- **right now:** current developments are continuously aggregated and organized;
- **over years:** issues remain as living dossiers and accumulate updates, history, sources, and changes.

The site should complement Papuan journalism and advocacy rather than imitate a newspaper. It does not need to publish a new article for every event. It should help people see how many pieces of reporting, documents, statements, and records relate to the same development and the same long-running issue.

The site should remain useful after the current Europe campaign ends.

## 2. The core information flow

The strongest working model is:

```text
NOW
current developments
        ↓
ISSUES
long-running, continuously maintained dossiers
        ↓
HISTORY
context for how those issues developed
        ↓
RESOURCES
the underlying record and source material
```

These are not four isolated silos. They should cross-link continuously.

A visitor reading a current development should be able to move into the relevant issue, then into historical context, then into the source material. A visitor reading history should be able to see which present-day issues it still affects. A resource should expose where it is used elsewhere on the site.

### Working secondary sections

- **Events** — talks, screenings, public programmes, campaign appearances.
- **Exhibition** — artworks, films, photography, writing, and other works presented through the campaign or related programmes.
- **SOS Papua** — a campaign page or campaign area, not necessarily the permanent identity of the whole site.
- **Ask** — a site-wide search and question interface, designed as part of navigation rather than as a chatbot product bolted onto the corner.

Again, these labels are intentionally boring working labels. That is a feature.

## 3. The homepage

The current direction is that the homepage should be dominated by **what is happening now** rather than by a conventional marketing hero.

The first screen should make the site immediately legible:

```text
WEST PAPUA WATCH

Now   Issues   History   Events   Exhibition   Resources       Ask

[ current development / current situation ]
```

The visitor should not have to first read an explanation of the website, its methodology, or its architecture.

### What the main feed shows

The primary unit is a **development**, not an individual article.

A development can contain reporting from multiple sources about the same real-world event or meaningful change. The UI can expose:

- a concise headline;
- a short synthesis;
- time since update;
- number of sources;
- key image or map when useful;
- related issue;
- access to the underlying sources.

This can borrow the story-cluster clarity of products such as Particle without becoming a general-interest news product.

The front page should be curated by **importance and relevance**, not merely by article volume, virality, or publication velocity.

## 4. Issues are living dossiers

An Issue can remain active for months or years.

It should behave more like a maintained dossier than a topic tag.

A strong issue page may contain:

```text
Issue title
Last updated

Current status

What changed
- development
- development
- development

Timeline

Background

Key documents

Reporting

Related history

Related issues
```

The page should always represent the best current state of the record while preserving older snapshots and the developments that led there.

Do not regenerate an entire dossier from scratch every time a new article arrives. Treat new information as a delta against persistent editorial state.

## 5. History is the main story-driven experience

The previous paper-theatre direction is no longer the implementation foundation. Its tactile, archival sensibility can survive, but we should not create a 3D asset-production dependency for launch.

History is where the site can become the most immersive.

The visual vocabulary can combine:

- maps;
- photographs;
- archival documents;
- short passages of text;
- dates and metadata;
- source references;
- diagrams where they genuinely help.

The experience should feel like moving through an evolving record rather than scrolling through a standard textbook timeline.

Possible sequence patterns are intentionally not frozen:

- a changing evidence table;
- a pinned map with changing documents and images;
- one strong visual composition per chapter;
- a sequence that preserves traces of prior moments;
- occasional split views where distinct accounts or interpretations need to be shown separately;
- entry into history through a present-day issue, with chronology still available.

The design should allow silence. Not every viewport needs to animate.

## 6. Resources are functional on purpose

The resource library should be the least theatrical part of the site.

People should be able to find a report, legal document, map, film, article, public statement, dataset, or archived material quickly.

The interaction priority is:

```text
search → filter → inspect metadata → open
```

Do not turn sources into giant cards or animated objects. Good source metadata and excellent search are the design.

## 7. Events and Exhibition

These can live beside one another in navigation while remaining separate content models.

### Events

Optimize for date, city, venue, programme, participants, and practical details.

### Exhibition

Optimize for the work itself. Preserve original aspect ratio and presentation. Include artist/creator, title, date, medium, context, accessibility information, and reproduction terms where applicable.

Do not force exhibition work into the site's own collage or visual treatment.

## 8. SOS Papua

SOS Papua should be able to exist as a strong campaign page without forcing the permanent site to carry emergency-campaign language forever.

During the current campaign, the page can be promoted prominently from the homepage and header. After the campaign, it can remain as a durable campaign record.

This lets the site support future campaigns without repeatedly renaming the entire platform.

## 9. Agent-native, without looking like an AI product

The website should feel queryable.

The default interface should be closer to:

```text
Ask / Search    ⌘K
```

than to a floating bot avatar.

The Ask surface can combine:

- navigation results;
- search results;
- source results;
- suggested questions;
- cited answers grounded in the site's corpus.

On a specific issue or history page, it can become contextual automatically.

The AI should not be the authority. Its job is to **find, explain, connect, and cite** material already represented by the site.

The content layer should also be friendly to external agents through structured data, stable URLs, Markdown representations where practical, a site-level machine-readable index, and well-described metadata.

## 10. Visual and interaction standard

The site should look like it was made by an excellent editorial design team and an Awwwards-calibre frontend developer who also remembers that people need to read it.

That quality bar means:

- strong composition rather than decoration;
- excellent type rather than excessive UI chrome;
- custom interactions where they improve understanding;
- motion with authored timing and purpose;
- careful image art direction;
- precise spacing and responsive behavior;
- excellent accessibility;
- graceful degradation;
- obsessive performance work;
- no obvious "template" or "default component library" look.

**Awwwards-level does not mean maximum animation.** It means the page feels intentional at every scale.

### Motion principle

Nothing should move merely to prove that JavaScript was installed successfully.

Motion should communicate one of:

- hierarchy;
- continuity;
- time;
- spatial relationship;
- change;
- navigation;
- focus.

The best animated sections should still make sense as static compositions.

## 11. Lightweight by design

Visitors in Papua are first-class users, including people on low-end Android devices, limited memory, and unstable or expensive mobile data.

The experience should therefore use progressive enhancement:

1. semantic HTML and readable CSS first;
2. optimized images and SVG;
3. light interaction and motion;
4. richer sequences only when useful and supported.

Core content must not depend on WebGL, autoplay video, large JavaScript bundles, or the embedded agent.

### Practical performance target

Treat these as goals rather than ceremonial Lighthouse numbers:

- meaningful first content quickly on mid/low-end mobile;
- initial experience roughly around 1–1.5 MB where practical;
- responsive AVIF/WebP images;
- minimal font payload;
- below-the-fold lazy loading;
- no WebGL requirement for navigation or reading;
- reduced-motion support;
- no smooth-scroll library by default unless it demonstrably improves the experience without hurting accessibility or low-end performance.

## 12. Editorial language

UI copy should be direct, plain, and restrained.

Good:

- Now
- Issues
- History
- Resources
- Events
- Exhibition
- Sources
- Updated 2h ago
- 8 sources
- Current status
- What changed

Avoid:

- metaphorical navigation labels;
- dramatic chapter names as interface taxonomy;
- slogans standing in for information architecture;
- microcopy explaining why a page exists;
- copy explaining obvious interface behavior;
- prosecutorial or sensational labels such as "proof" or "receipts";
- repeated paragraphs about the site's trustworthiness.

Trust should come from provenance, source visibility, careful wording, corrections, and transparent methodology where methodology is actually needed.

## 13. Visual things to avoid

- generic SaaS cards everywhere;
- pill-shaped everything;
- rainbow category systems;
- decorative gradient blobs;
- glassmorphism as a default surface;
- huge radii on every container;
- animation on every scroll boundary;
- icon-heavy navigation when text is clearer;
- stock NGO visual language;
- faux classified-document / spy-dossier cosplay;
- 3D for its own sake;
- a giant chatbot as the first thing people see.

## 14. Product test

When evaluating a page or interaction, ask:

1. Can a first-time visitor understand what this page is for without explanatory copy?
2. Does the important information appear before the site's self-description?
3. Can a current development lead naturally to a longer-running issue?
4. Can the issue lead naturally into history and sources?
5. Does every important factual synthesis expose its underlying sources?
6. Does the page remain usable with animation disabled?
7. Does it remain usable on a low-end phone?
8. Is the interaction distinctive because it improves the story, or merely because it is distinctive?
9. Does this feel authored rather than assembled from a component catalogue?

If those answers are good, we are probably still pointed north.

## 15. What is deliberately not frozen

- final domain and masthead treatment;
- exact navigation labels;
- whether `Now` and `/` are the same route;
- issue taxonomy;
- exact ranking policy;
- visual palette;
- exact typefaces;
- exact animation system;
- precise history narrative structure;
- the final role and prominence of SOS Papua;
- agent model/provider;
- backend vendor choices.

The information model and experience principles matter more than any one implementation detail.
