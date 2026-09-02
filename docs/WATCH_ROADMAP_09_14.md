# West Papua Watch — Freeze 09–11 Canonical Roadmap

**Status:** Frozen project direction for the next major implementation passes
**Canonical baseline:** `main` at `86ab0036a91efe66ca8ed2942d7409d1f71b9dd9` (`add bounded provider failover`)
**Date frozen:** 2026-09-02
**Purpose:** Carry the converged product, information-architecture, newsroom, map, Issues, History, Resources, Events, and Exhibition decisions forward without re-deriving them from chat history.

---

## 0. North star

West Papua Watch should **not become another Papua news site**.

The newsroom is important, but it is one moving input into a broader public resource. The product should connect:

- current reporting;
- persistent Issues;
- geographic data;
- history;
- public records and long-form Resources;
- events and campaign materials;
- exhibition works, people, archives, and programmes;
- source provenance;
- Ask over the combined knowledge base.

The core product distinction is:

> **Watch is a living West Papua information and reference system with a newsroom at its moving edge.**

The UI should show this rather than explain it.

Avoid prosaic self-description, slogans, and interface copy that narrates the product philosophy. Use plain labels such as `Current`, `Issues`, `History`, `Resources`, `Events`, `Exhibition`, `Map`, `Layers`, `Search`, `Source`, `Updated`, and `Coverage`.

---

# 1. Current baseline to preserve

Freeze 08.10 / 08.10.1 established the newsroom foundation. Do not reopen this architecture casually.

## 1.1 Newsroom cadence

Automatic newsroom checkpoints:

- 06:00 WIT
- 09:00 WIT
- 12:00 WIT
- 15:00 WIT
- 18:00 WIT

These are **checkpoints**, not rigid newspaper editions. The site stays continuously current. Manual execution remains available only through protected admin tooling.

The cadence was intentionally reduced from 30-minute polling because Papua newsrooms publish in bursts and the freshness gain from 48 runs/day was marginal compared with the operational cost.

## 1.2 Request-budgeted inference

Current intended provider lanes:

### Writer / synthesis
1. Gemini 3.5 Flash-Lite
2. OpenRouter MiniMax M3 Free
3. Groq Qwen 3.8 27B

### Fast / extraction / clustering adjudication / critic
1. Groq Qwen 3.8 27B
2. OpenRouter MiniMax M3 Free
3. Gemini 3.5 Flash-Lite

### Ask
1. Groq Qwen 3.8 27B
2. OpenRouter MiniMax M3 Free
3. Gemini 3.5 Flash-Lite

Rules:

- provider-node retries remain `0`;
- no recursive LLM repair;
- malformed output becomes durable state;
- quota/backpressure becomes durable state;
- model failure must not trigger queue retry storms;
- bounded provider failover is allowed for transport/quota/5xx conditions;
- editorial work is batched;
- one logical Watch → AI Gateway operation should remain legible in telemetry.

## 1.3 Editorial batching

The editorial scheduler is the only authority that dispatches editorial inference.

Current target:

- up to 4 Developments per writer batch;
- one writer request for the batch;
- one critic request for successfully parsed drafts;
- each Development persists independently;
- a missing/malformed sibling must not invalidate valid siblings;
- critic `revise` becomes pending work for a later checkpoint, never immediate self-requeue.

## 1.4 Fast-lane batching

Story Packet extraction and ambiguous event matching should be batched by **token budget**, not by arbitrary article count alone.

Current practical target:

- Story Packet batch maximum around 4 items at launch;
- sharpen input deterministically before the LLM;
- batch ambiguous article → candidate Development decisions.

## 1.5 Vectorize is optional

Dense embeddings are an enhancement, not a hard dependency.

Always-on retrieval should work through D1/FTS and structured event/entity data. If embedding quota is exhausted:

- ingestion continues;
- clustering continues;
- Current continues;
- Ask still has sparse retrieval.

Dense Vectorize candidates may be fused in when available.

---

# 2. Canonical information model

The site should stop treating content as unrelated pages and converge on a small set of shared objects.

## 2.1 Public-facing objects

### Issue
A persistent dossier about a durable, concrete situation or system.

Examples:

- Mining in Raja Ampat
- Conflict, displacement and access
- South Papua food and energy projects
- Lake Sentani watershed

### Development
A concrete event or evolving event cluster.

Examples:

- a new permit decision;
- an official announcement;
- a community statement;
- a court ruling;
- a military/police operation;
- a new environmental incident.

### Report
An individual source item: article, statement, press release, public record, or other report feeding a Development.

### Resource
A report, research paper, official record, legal instrument, long-form reference, dataset, archive, or cultural reference.

### Place
Canonical geography used by Current, Issues, Resources, History, Exhibition, Events, and the map.

### History event
A dated historical moment, document, location, actor, image, or archival object.

### Event
A programme/campaign/public event entry.

### Exhibition item
A person, collective, work, archive item, programme, film, performance, installation, theme, or related media object.

## 2.2 Internal taxonomy

Internally it is useful to retain a broad `area` layer above Issues, but do not overexpose implementation vocabulary in the interface.

Initial broad areas:

1. Land & extraction
2. Human rights & militarization
3. Indigenous rights & governance
4. Environment & biodiversity
5. Health, food & livelihoods
6. Education, knowledge & culture
7. Women & gender

These are **lenses**, not mutually exclusive news categories.

A Development can belong to multiple Issues and areas.

## 2.3 Relations

Canonical relation shape:

```text
Area        ←→ Issue
Issue       ←→ Development
Development ←→ Report
Development ←→ Place
Issue       ←→ Place
Resource    ←→ Issue
Resource    ←→ Place
History     ←→ Place
Exhibition  ←→ Place
Exhibition  ←→ Resource
Event       ←→ Exhibition
```

Do not retain the long-term assumption that a Development has exactly one `issue_slug`.

Move toward many-to-many relations.

---

# 3. Freeze 09 — Trust, population, and knowledge model

**Goal:** Make the data trustworthy, populate the site, secure internal controls, and make D1 describe the actual Watch product instead of only the newsroom.

This should be a substantial patch, not a sequence of cosmetic micropatches.

## 3.1 Lock admin/internal endpoints

The current public `/run` behavior is unacceptable now that inference is live.

Introduce a dedicated admin secret, for example:

```text
WATCH_ADMIN_TOKEN
```

Protect all operational/internal endpoints that can:

- trigger inference;
- trigger ingestion;
- run backfill;
- inspect reviewer/critic internals;
- inspect private operational telemetry;
- manipulate candidate Resources or editorial state.

At minimum:

```text
/run
/backfill
/review/*
/internal/*
```

Public read APIs remain public.

Rules:

- use bearer authorization;
- return ordinary 401/403 responses;
- do not leak the token;
- secrets belong in Cloudflare secrets, not repository config;
- admin endpoints should not be reachable accidentally from public UI.

## 3.2 Fix Papua relevance

The current flaw is structural:

- `scope: papua` sources such as Jubi are treated as automatically relevant;
- therefore non-Papua regional/Pacific/world reporting from those publishers can enter Watch.

**Source scope becomes a prior, not a verdict.**

### Relevance flow

```text
article
  ↓
deterministic high-recall triage
  ↓
KEEP / DROP / AMBIGUOUS
  ↓
AMBIGUOUS → batched Qwen relevance
```

### KEEP

Strong Western New Guinea signal in title, lede, or selected evidence, including:

- place names and aliases;
- provinces/regencies/cities;
- Papuan organisations/institutions;
- explicit projects/issues;
- clear Indigenous/Papuan actor references.

### DROP

Only for strong negatives, such as:

- clearly foreign-only reporting;
- clearly national/international reporting with no material Papua connection.

**Absence of the word `Papua` is never sufficient reason to drop an article.**

### AMBIGUOUS

Anything plausible but uncertain proceeds to the fast model.

Add explicit prompt guidance:

> Publisher identity alone is not evidence that an article concerns West Papua. Papua-focused publishers also report national, Pacific, and international news.

Remove any unconditional `scope === "papua" => relevant` behavior.

## 3.3 Clean already-published irrelevant Developments

After the relevance gate is fixed, perform a conservative cleanup of recent published Developments.

Safe deterministic cleanup criteria may include:

- no strong Western New Guinea signal;
- all associated Story Packets are irrelevant;
- no canonical Place in Western New Guinea;
- no Issue relation.

Mark these as filtered/hidden rather than destructively deleting provenance.

Do not use a broad LLM rewrite just to erase old mistakes.

## 3.4 Add 14-day backfill

Add a first-class protected backfill operation.

Defaults:

- default window: 14 days;
- configurable up to roughly 31 days;
- same canonical URL dedupe as normal ingestion;
- same relevance gate;
- same Story Packet batching;
- same clustering logic;
- same editorial pending state;
- no separate “cheap but inaccurate” historical path.

Backfill source discovery may use:

- RSS/Atom history where available;
- source archive/category pagination;
- sitemaps;
- explicit source-specific archive adapters where necessary.

Do not assume the first 24 current RSS items are an archive.

### Backfill editorial policy

Do **not** synthesize every discovered historical event immediately.

Backfill should:

1. discover;
2. extract;
3. filter;
4. cluster;
5. create/update Developments;
6. mark relevant Developments pending.

Then editorial admission can publish the most useful/recent backlog in bounded batches.

For the initial population, manually draining ~3–4 editorial batches (roughly 12–16 strong Developments) is a reasonable launch pass before normal checkpoints continue.

## 3.5 Add key points without adding requests

Extend the existing writer schema with:

```text
key_points_en[]
key_points_id[]
```

Target roughly 3–5 concise bullets.

They must be supported by the same evidence as the summary.

This is **not** a new LLM call.

## 3.6 Make Development pages visibly different from articles

A Development is a cluster, not an article wrapper.

Target content structure:

```text
← Current

category / place

Headline

2–4 sentence summary

reports · sources · updated

image

Key points

What changed

Source agreement / disagreement
  only if multi-source

Latest reports
  chronological individual reports

Related Issues

Sources
  full provenance
```

### Single-source handling

Never imply consensus.

Use a plain single-source state such as:

```text
Reporting so far
1 source
```

No defensive essay is needed.

## 3.7 Fix Current page duplication

Current presently uses the same Development collection for both the lead’s “new developments” and the larger “more developments” area.

Correct hierarchy:

### Lead Development
One featured Development.

### Latest reports in this Development
Individual Reports belonging to the lead Development, chronological.

### More Developments
Other Development IDs.

This teaches the reader:

```text
Development = story/event cluster
Report      = individual source item
```

without a tutorial.

## 3.8 Simplify metadata/eyebrows

Avoid crowded metadata strings.

Preferred grammar:

Above headline:

```text
POLITICS · JAYAPURA
```

Below summary:

```text
2 reports · 2 sources · updated 48m ago
```

Cards:

```text
HUMAN RIGHTS · NDUGA
...
3 reports · updated 2h ago
```

Do not repeat `West Papua`, `Newsroom synthesis`, multiple source counts, language, and topic taxonomy in the same eyebrow.

The masthead already establishes site context.

## 3.9 Move Issues from hardcoded application objects toward D1

Seed the existing Issues into D1 rather than treating them as permanent TypeScript constants.

Suggested `issues` fields:

```text
slug
title_en
title_id
summary_en
summary_id
category / area
status
origin
first_seen_at
last_seen_at
active
concepts_json
```

Introduce an explicit join table:

```text
development_issues
  development_id
  issue_slug
  score
  relation
```

Possible relations:

```text
primary
related
background
```

The existing Issues become seed/editorial dossiers, not hardcoded runtime logic.

## 3.10 Emerging Issues remain a discovery layer

Do not automatically promote every recurring cluster into a permanent Issue.

Flow:

```text
Emerging pattern
    ↓
Issue candidate
    ↓
editorial/steward approval
    ↓
persistent Issue
```

Automation can surface patterns. Persistent dossiers remain editorially governed.

Emerging Issue analysis should run on a slow/background cadence, not every newsroom checkpoint.

## 3.11 Add canonical Places

Create a small, explicit Place registry.

Example:

```text
id: raja-ampat
name: Raja Ampat
aliases:
  - Kabupaten Raja Ampat
  - Raja Ampat Islands
kind: regency
province: papua-barat-daya
lat: ...
lon: ...
```

Support:

- provinces;
- regencies/cities;
- important towns;
- islands;
- watersheds;
- culturally meaningful regions;
- major project areas;
- other geographically useful named entities.

Story Packet place strings should normalize into canonical Place IDs where possible.

The Place model becomes shared infrastructure for:

- map;
- Current;
- Issues;
- Resources;
- History;
- Ask;
- Events;
- Exhibition.

## 3.12 Freeze 09 acceptance criteria

Freeze 09 is done when:

- `/run` and internal endpoints require admin auth;
- Palau/Solomons-style non-Papua stories no longer pass simply because they came from Jubi;
- at least 14 days can be backfilled safely;
- backfill does not create request storms;
- recent relevant Developments visibly populate Current;
- key points render from the existing writer call;
- Current distinguishes Reports from Developments;
- Issues are no longer purely hardcoded application constants;
- Issue ↔ Development many-to-many exists;
- canonical Places exist and current news can map to them;
- all changes preserve Freeze 08.10 request-budget invariants.

---

# 4. Freeze 10 — Geographic system and homepage reframe

**Goal:** Give Watch a distinct identity as a place-based information system without turning every route into a GIS dashboard.

The map is not global UI state.

> **Geography is shared context. The map is one rendering of that context.**

## 4.1 Where maps appear

### Home `/`
Contains the **full interactive map**.

This is the canonical map experience at launch.

### Issue pages
May use a small/minimal contextual map hero when geography contributes meaning.

### Current/Development pages
May use a contextual map when the event is meaningfully spatial.

Do not display a map merely because a Place field exists.

### History
Uses a specialized authored/scrollytelling map mode.

### Resources / Events / Exhibition
No map by default.

Only show a map when the specific object materially benefits from one.

## 4.2 No dedicated `/map` route required at launch

The homepage map is canonical.

`Expand` opens the same map in a fullscreen dialog/state.

Benefits:

- no extra route before it solves a real need;
- better mobile ergonomics;
- one implementation;
- state can still be URL-encoded.

If independent map linking becomes important later, a `/map` route can reuse the same component.

## 4.3 Map interaction modes

The map must support two distinct modes.

### Following page

Editorial context can guide the map.

Examples:

- selecting `Land & extraction` changes visible layers;
- focusing an Issue changes camera and layer preset;
- Current can highlight a selected Development.

### Explore

The user takes control.

Once Explore is active:

- page cards stop changing the map;
- layer controls are fully available;
- the user can search places;
- the user can turn layers on/off independently;
- a `Return to page view` action restores the page preset.

This avoids making the map feel controlled by scrolling content after the user intentionally starts exploring.

## 4.4 State rules

### Page preset state
Owned by the route/component.

Temporary.

### Explore state
Owned by the user.

Encode intentional state in the URL where useful:

```text
/?place=raja-ampat&layers=mining,fires
```

### Return state
Normal browser navigation may restore prior Explore state.

Do not persist arbitrary map camera/layer state globally across unrelated pages.

## 4.5 PMTiles from the beginning

Large/static geospatial data should use PMTiles immediately.

Reason:

- cheap-phone performance;
- range requests;
- CDN friendliness;
- no tile server;
- zoom-dependent simplification;
- easy Cloudflare hosting;
- avoids forcing phones to download multi-megabyte national GeoJSON files.

Architecture:

```text
MapLibre
  │
  ├─ PMTiles
  │    boundaries
  │    cultural regions
  │    mining
  │    concessions
  │    protected areas
  │    infrastructure
  │
  ├─ live/small GeoJSON
  │    Current Developments
  │    FIRMS hotspots
  │    other live point/event overlays
  │
  └─ raster
       only where useful
       satellite / rain / forest-loss etc.
```

## 4.6 Western New Guinea only

Do not copy Detak Detik’s Indonesia-wide bundles.

Build a canonical geography pipeline:

```text
upstream source
    ↓
filter Western New Guinea
    ↓
clip
    ↓
normalize fields
    ↓
simplify by zoom
    ↓
PMTiles
```

This should dramatically reduce payload size.

## 4.7 Generalized plumbing

Do not reuse Detak Detik metaphors in Watch internals.

Avoid names such as:

- `PetaKabar`;
- `Dinas`;
- `Lensa`;
- other newspaper-specific abstractions.

Prefer boring reusable names:

```text
geo/
  sources/
  transforms/
  builds/

src/lib/map/
  registry.ts
  presets.ts
  places.ts
  styles.ts
  state.ts

src/components/map/
  Map.tsx
  MapControls.tsx
  LayerPanel.tsx
  FeaturePanel.tsx
  MapHero.tsx
```

The data and interaction model should survive future art-direction changes.

## 4.8 Layer registry contract

Every map layer should use a common contract.

Conceptually:

```text
id
family
title
description

source_type
  pmtiles
  geojson
  raster
  live

source
source_url
attribution
license

updated_at
coverage
coverage_notes

min_zoom
max_zoom

style
legend
```

This lets the same map component handle static and live layers consistently.

## 4.9 Launch map layers

Initial high-value map set:

### Boundaries
1. Province boundaries
2. Seven cultural/reference regions

### Extraction
3. Mining IUP/WIUP
4. Logging / HTI / available plantation permits

### Environment
5. Protected areas
6. NASA FIRMS fire hotspots

### Watch
7. Current Developments

This already proves:

- static administrative context;
- cultural/reference geography;
- large static polygons;
- environmental context;
- live external data;
- Watch’s own dynamic data.

Next layers can slot into the registry without redesign.

## 4.10 Later map layers

Prioritized future layers:

### Environment
- forest-loss alerts;
- watersheds;
- rainfall;
- flood/discharge;
- biodiversity/protected-area context;
- marine/coastal context.

### Infrastructure
- roads;
- airports;
- commercial air connectivity;
- ports;
- electricity where reliable;
- internet/mobile connectivity.

### Connectivity
Potential sources include:

- public Indonesian/BPS/Komdigi connectivity indicators;
- Ookla open aggregate Speedtest tiles for measured performance, with correct license/attribution and clear explanation that observations are measurements, not theoretical coverage.

Do not imply “no Ookla observation” equals “no internet”.

### Extraction and industry
- extractive companies;
- mineral/resource types;
- industrial facilities;
- project boundaries;
- concession metadata.

## 4.11 Cultural regions

The seven cultural regions should **not** be styled as ordinary administrative borders.

Preferred cartographic grammar:

```text
Provinces
solid thin administrative lines

Cultural regions
soft dashed/reference boundary treatment
```

UI can simply label them `Cultural regions`.

A small metadata/citation surface should document methodology/source.

Avoid overclaiming precision.

## 4.12 Live aircraft

Do not make individual aircraft a primary Watch map feature.

For Watch, infrastructure layers should emphasize:

- airports;
- commercial routes;
- connectivity;
- access dependence;
- isolation.

Avoid operational real-time military/security movement monitoring.

Human-rights/security mapping should use published/historical/reporting evidence and appropriate aggregation rather than turning Watch into a live surveillance interface.

## 4.13 Visual style

One art-directed map style at launch.

### Site
- near-black/dark base;
- white/grey hierarchy;
- restrained lilac/periwinkle signal.

### Map
- light atlas plate inside the dark site;
- warm off-white/cool ivory base;
- quiet coastlines;
- sparse labels;
- thin graphite administrative lines;
- cultural regions softer/dashed;
- subtle lilac selection/focus state;
- no category rainbow by default;
- no generic dark Mapbox visual language.

The contrast between dark editorial shell and light geographic plate is intentional.

The map should feel like a modern atlas/scientific plate inserted into the interface.

## 4.14 Large title on map

For contextual map heroes, the large Swiss title may sit directly on the map at the top-left.

Example conceptual composition:

```text
LAND & EXTRACTION

Mining in
Raja Ampat
```

over a clean light map.

Rules:

- preserve legibility;
- use a subtle local wash only if geometry becomes visually busy;
- do not add generic glass cards merely to hold the headline;
- keep rounded map corners consistent with current Watch media surfaces.

## 4.15 Controls

The default homepage map should be quiet.

Initial top-level controls may be as simple as:

```text
Boundaries
Extraction
Environment
Infrastructure
Current

Layers
Expand
```

Full Explore mode reveals structured controls.

Layer drawer groups:

```text
Boundaries
  Cultural regions
  Provinces
  Regencies

Extraction
  Mining permits
  Forest concessions
  Plantation permits

Environment
  Protected areas
  Forest loss
  Fire hotspots
  Floods

Infrastructure
  Roads
  Airports
  Connectivity

Current
  Developments
  Issues
```

Use plain labels.

Do not explain the philosophy of each layer in the toolbar.

## 4.16 Feature panel

Clicking a feature should produce a Watch-style evidence panel.

Example mining feature:

```text
Mining permit

PT ...
Raja Ampat · Southwest Papua

Commodity
Nickel

Permit area
13,136 ha

Activity
Production operation

Source
ESDM Geoportal

Updated
2026-09-02

Coverage
West Papua
```

Then related content:

```text
Issues
Developments
Resources
Source ↗
```

Feature panels should prioritize:

- what;
- where;
- source;
- date;
- coverage;
- caveats;
- related Watch content.

## 4.17 No fake/example map data

Detak Detik sometimes degrades to labeled example data for demonstration.

Watch must not.

If a live layer fails:

```text
Data unavailable
```

If stale:

```text
Updated 2026-08-28
```

If partial:

```text
Partial coverage
```

Silence or explicit unavailability is preferable to fabricated completeness.

## 4.18 Reuse established libraries

The existing Watch design grammar already prefers component primitives as behavior rather than visual authority.

Use established interaction primitives for:

- Dialog;
- Drawer;
- Popover;
- Tooltip;
- Tabs;
- ToggleGroup;
- Accordion;
- Command/search;
- focus management;
- keyboard handling;
- accessible escape/close behavior.

Use shadcn/Base UI-style primitives where appropriate, but style them completely in Watch’s design grammar.

The map itself uses **MapLibre**.

Do not build WebGL mapping from scratch.

Do not install a large app state framework unless genuinely needed.

Prefer:

- URL state;
- component-local state;
- a small event contract between editorial components and the map.

A tiny Astro-friendly shared store can be added later only if the interaction actually requires it.

## 4.19 Homepage reframe

The homepage should no longer be a news homepage.

Target structure:

```text
WEST PAPUA
Watch

[ full interactive map ]

Issues.

[ persistent dossier list / editorial grid ]

Current.

[ current lead Development ]
[ recent Development cards ]
All current developments →

Resources.

[ selected/current reference rows ]

Programme.

[ Read My World / campaign / event context when active ]
```

No long explanatory section copy.

No slogans such as `What we watch`.

Use labels:

- `Issues.`
- `Current.`
- `Resources.`
- `Programme.`

The existing strong Current design should be preserved and moved/refined as the dedicated `/current` experience.

## 4.20 Freeze 10 acceptance criteria

Freeze 10 is done when:

- PMTiles infrastructure is in place;
- all large map data is Western New Guinea scoped;
- MapLibre is integrated cleanly;
- layer registry is generalized;
- the seven launch layers work;
- no example/fake map data is shown;
- homepage contains the full interactive map;
- Expand gives usable fullscreen Explore mode on mobile;
- user Explore mode is independent from page-driven map presets;
- URL can preserve useful intentional map state;
- Issue/Current pages can render minimal contextual MapHero only where relevant;
- Current remains a separate dedicated fast-moving page;
- the homepage no longer reads primarily as a news site;
- low-end mobile performance is treated as a first-class acceptance criterion.

---

# 5. Freeze 11 — Dossiers, Development UX, and historical geography

**Goal:** Make the shared knowledge model visible across Issues, Current, Resources, and History.

## 5.1 Dynamic Issue pages

Issue pages should be backed by D1/relations rather than static content alone.

Structure:

```text
← Issues

category

Issue title

summary

status
updated
developments
sources

contextual MapHero
  only when geography helps

Summary / context

Latest developments

Key documents/resources

Related Issues

Sources / methodology
```

The contextual map preset may include:

- relevant extraction/environment layers;
- related Places;
- current Developments.

Provide `Expand` to enter independent map exploration.

Add a real back link such as:

```text
← Issues
```

## 5.2 Development page refinement

Freeze 11 should finish the richer Development UI begun in Freeze 09.

Add:

- key points;
- report timeline;
- source provenance;
- clearer multi-source agreement/disagreement;
- related Issues;
- related Places;
- relevant Resources;
- optional contextual map;
- source dates/publishers;
- link back to Current.

Do not turn the page into an AI-written magazine feature.

Keep prose restrained and evidence-oriented.

## 5.3 Current page

Dedicated `/current` remains the fast-moving news surface.

Hierarchy:

1. lead Development;
2. reports inside the lead Development;
3. optional Current map;
4. other Developments;
5. filters by area/place where useful.

This page may retain much of the current strong visual design.

## 5.4 History as scroll-controlled geography

History is the one place where the map becomes deliberately authored/choreographed.

Use the same geographic core, not a second separate map engine.

History controller may drive:

- camera;
- visible layers;
- highlighted geography;
- year/time;
- path/trace;
- archival documents;
- photographs;
- labels;
- boundary state.

Concept:

```text
fixed map
+
scrolling dossier chapter
+
documents/photos
```

The user scrolls through historical moments while geography remains spatially coherent.

The path is a **historical trace**, not a fake literal travel route.

## 5.5 History visual behavior

Desktop may use:

```text
map / archival stage
|
reading rail
```

or another split arrangement where the map remains pinned.

As chapters advance:

- location highlights change;
- map focus changes;
- trace draws;
- dates update;
- document/photo overlays appear;
- labels fade in/out;
- historical boundary/reference data may change where appropriate.

Do not overanimate every transition.

Use GSAP ScrollTrigger only where the pinned authored sequence genuinely needs it.

Ordinary motion remains CSS/View Transitions/lightweight component motion.

## 5.6 Shared place linking

By Freeze 11, selecting a canonical Place should be able to connect:

```text
Place
  → Current Developments
  → Issues
  → Resources
  → History
  → Exhibition/Event material where relevant
```

The UI does not need to expose this as a graph.

It should simply make related material easy to reach.

## 5.7 Freeze 11 acceptance criteria

Freeze 11 is done when:

- Issues are truly live/dynamic dossiers;
- Issue pages use shared relation data;
- Development pages clearly show report-level provenance;
- Current, Issues, Resources, and History use canonical Places consistently;
- contextual maps are useful but not mandatory decoration;
- History uses the same map system in authored scroll mode;
- historical media/documents integrate with geography;
- route/page patterns feel like one coherent product rather than separate microsites.

---

# 6. Future Freeze 12 — Resources, Events, and Exhibition population

**Goal:** Replace seed/placeholder content with a living, provenance-aware resource and cultural programme system.

Current repository reality:

- `content/exhibition.json` is a small seeded list;
- current examples include Udeido Collective, Hidden Faces of Papua, Koreri/collective memory, Oceanic Solidarity, archive material, and film/public discussion;
- some entries are clearly placeholders or reference scaffolding rather than a complete exhibition catalogue.

This should evolve without turning cultural material into autonomous AI slop.

## 6.1 Exhibition content model

Split the current generic exhibition-item idea into explicit types while keeping one shared rendering system.

### Person
Fields:

```text
id
name
role
bio_short
bio_long
links
image
image_credit
permissions
places[]
resources[]
```

### Collective / organisation

```text
id
name
summary
description
links
image
credits
people[]
places[]
resources[]
```

### Work

```text
id
title
creator_ids[]
year
type
materials / medium
summary
description
images[]
video/audio links
credits
rights
place_ids[]
issue_ids[]
resource_ids[]
```

### Programme item

```text
id
title
event_id
date
time
venue
participants[]
summary
links
media[]
```

### Archive item

```text
id
title
date
type
description
source
source_url
rights
files/media
place_ids[]
resource_ids[]
```

### Theme

Use sparingly.

Themes should organize real exhibition material rather than exist as filler cards.

## 6.2 Exhibition ingestion/population pipeline

The Exhibition pipeline should be **source-driven and stewarded**, not fully autonomous.

Recommended flow:

```text
trusted source
  ↓
candidate record
  ↓
extract factual metadata
  ↓
rights / credit check
  ↓
duplicate/entity match
  ↓
steward review
  ↓
publish
```

Sources may include:

- official artist/collective pages;
- Read My World programme pages;
- venue/programme pages;
- PUSAKA campaign materials;
- exhibition catalogues;
- public artist bios;
- supplied photographs;
- uploaded campaign archives;
- authorised media packages.

### LLM use

LLM may assist with:

- metadata extraction;
- normalization;
- translation drafts;
- duplicate/entity matching;
- concise summaries from supplied source text.

LLM should **not** invent:

- biography;
- interpretation;
- artwork meaning;
- provenance;
- dates;
- credits;
- permissions;
- cultural context not supported by sources.

If source evidence is thin, publish less.

## 6.3 Rights and credit are first-class fields

Every image/media object should carry:

```text
creator / photographer
source
credit_line
rights / permission status
source_url
alt text
```

Do not scrape and silently rehost arbitrary artwork.

Where only linking is appropriate, link.

Where supplied/permissioned media exists, host/cache according to the final media storage plan.

## 6.4 Exhibition visual grammar

Preserve the existing direction:

- visual;
- image-led;
- minimal explanatory chrome;
- swipe/horizontal treatment where it works on mobile;
- large artwork/media surfaces;
- direct reveal into a work/person rather than forcing multiple redundant detail screens;
- consistent with Watch typography and spacing;
- do not make it look like a separate museum-template website.

Theodore/Udeido-style reveal interactions already explored earlier can be retained where they genuinely improve the work presentation.

The exhibition should feel like another content mode inside Watch, not a bolted-on gallery.

## 6.5 Exhibition relations

Connect cultural material into the same shared system when justified.

Examples:

```text
Work → creator
Work → Event
Work → Resource
Work → Place
Work → Issue
Person → Programme
Programme → Event
Archive item → History
```

Do not force every artwork into a political Issue.

Relations should reflect the supplied/public source material.

## 6.6 Events / programme pipeline

Events should remain factual and operational.

Fields:

```text
title
date
time
timezone
venue
city
participants
description
links
status
source
```

The page should support:

- current campaign/programme;
- confirmed schedule;
- venue;
- links;
- downloadable materials;
- partner organisations;
- Exhibition relationships.

No need for prose-heavy campaign explanation where the programme itself communicates the point.

## 6.7 Resources population pipeline

Resources should become much deeper than the current seed list.

Target types:

- official record;
- law/treaty/resolution;
- research;
- report;
- dataset;
- investigation;
- cultural reference;
- archive;
- legal material;
- campaign/public information.

Each Resource should carry:

```text
title
type
publisher/author
date
language
summary
source_url
file_url where permitted
rights/license
areas[]
issues[]
places[]
tags[]
```

### Resource acquisition

Use a stewarded intake process:

```text
source registry
  ↓
candidate
  ↓
metadata extraction
  ↓
dedupe
  ↓
classification
  ↓
steward approval
  ↓
publish
```

Do not make the public Resources page dependent on live third-party crawling.

Prefer periodic population into Watch-owned structured metadata.

---

# 7. Future Freeze 13 — Ask over the full knowledge system

Once Current, Issues, Places, Resources, History, and Exhibition share stable structured relations, Ask should stop behaving like “chat over recent articles”.

Retrieval should draw from:

- Development syntheses;
- individual Reports for provenance;
- Issues;
- Resources;
- History;
- Places;
- Exhibition/Event material where relevant.

FTS remains always available.

Vector retrieval is optional enhancement.

Ask answers should:

- cite source objects;
- distinguish reporting from official records and civil-society claims;
- preserve disagreement;
- say when evidence is insufficient;
- link users to the underlying Issue/Development/Resource rather than becoming a replacement for browsing.

---

# 8. Future Freeze 14 — Additional geographic layers and deeper monitoring

After the PMTiles system is stable, add layers based on value and reliable sourcing rather than visual novelty.

Potential additions:

- forest-loss alerts;
- protected/ecologically sensitive areas refinement;
- watersheds;
- flood/river discharge;
- rainfall;
- airports and commercial routes;
- roads;
- ports;
- population context;
- health/education facilities where reliable;
- internet/connectivity;
- industrial/emissions data;
- additional extractive/company datasets;
- source-backed displacement/human-rights geography at an appropriate level of aggregation.

Every layer must include:

- source;
- date/snapshot;
- license/rights;
- coverage;
- caveats.

---

# 9. Design system rules to preserve

The existing Watch visual language is strong. Do not replace it with generic component-library aesthetics.

## 9.1 Core direction

Modern editorial / investigative interface:

- precise;
- contemporary;
- serious;
- image-aware;
- typographically confident;
- restrained chrome;
- strong hierarchy;
- maps/documents/photos as primary objects;
- occasional cinematic treatment where justified.

Not:

- newspaper cosplay;
- NGO template;
- dashboard;
- faux archive;
- generic SaaS;
- shadcn default styling.

## 9.2 Components

Use established libraries for behavior.

The project design direction already favors:

- Astro;
- interactive islands only where needed;
- Base UI/shadcn-style primitives for accessibility;
- Watch-owned CSS/tokens for appearance;
- Motion/native CSS for normal interactions;
- GSAP only for authored History choreography.

Component system ≠ design system.

## 9.3 Vocabulary

Use plain pragmatic UI labels.

Good:

```text
Current
Issues
History
Resources
Events
Exhibition
Map
Layers
Search
Source
Updated
Coverage
Reports
Places
```

Avoid self-important descriptive labels or product philosophy in the interface.

Do not narrate that the map is “the land speaking”, that Watch “remembers”, etc.

Show the system.

---

# 10. Homepage and navigation target

Primary navigation remains:

```text
Current
Issues
History
Resources
Events
Exhibition
```

Logo/masthead can serve as Home.

Homepage target:

```text
Masthead / campaign strip

Full map

Issues

Current

Resources

Programme / Event
```

The exact ordering below map can be tuned with real populated content, but the homepage should remain a resource/monitoring overview rather than a conventional news feed.

---

# 11. Performance rules

Performance is a product requirement.

Assume:

- 4 GB RAM Android devices;
- weak mobile data;
- older browsers;
- intermittent connectivity.

Rules:

- PMTiles for large static geography;
- geographically clip to Western New Guinea;
- aggressive but visually safe simplification;
- lazy-load map interaction below critical UI where appropriate;
- maps must not block reading content;
- live overlays should be optional and cached;
- avoid large frontend state frameworks;
- avoid heavyweight animation libraries outside specific use cases;
- progressive enhancement;
- the site remains useful if MapLibre never hydrates.

---

# 12. Data integrity rules

These are non-negotiable.

## News
- preserve source provenance;
- preserve disagreement;
- attribute sole-source claims;
- do not invent cross-source consensus.

## Map
- no fake/example data;
- expose source/date/coverage;
- label partial datasets honestly.

## History
- source historical claims;
- distinguish archival record, interpretation, and disputed claims.

## Exhibition
- preserve creator/photo credits;
- track permissions/rights;
- do not invent cultural/artistic interpretation.

## Resources
- metadata should be source-backed;
- distinguish official/public records from NGO/research/editorial material.

---

# 13. Execution order

Recommended large-patch sequence:

```text
Freeze 09
Trust + relevance + backfill + knowledge model

        ↓

Freeze 10
PMTiles geographic system + homepage reframe

        ↓

Freeze 11
Dynamic dossiers + richer Development UX + History geography

        ↓

Freeze 12
Resources + Events + Exhibition population/pipeline

        ↓

Freeze 13
Ask over the shared knowledge system

        ↓

Freeze 14
Additional map/data layers
```

Do not interleave substantial map implementation with unfinished relevance/backfill cleanup unless there is a very specific blocker.

The product will be much easier to design once real Papua Developments and Issues populate the system.

---

# 14. What should not change casually

Treat the following as frozen unless real production evidence says otherwise:

- 5 newsroom checkpoints/day;
- request-budgeted batching;
- bounded provider fallback with zero node retries;
- no same-cycle LLM repair;
- durable backpressure/failure state;
- scheduler-only editorial admission;
- FTS/structured retrieval works without Vectorize;
- the map is shared geographic infrastructure, not global sticky UI;
- full map lives on Home at launch;
- other pages use maps conditionally;
- PMTiles is the default for substantial static geography;
- Western New Guinea clipping happens during data build;
- no fake map data;
- Issues are persistent dossiers, Developments are events, Reports are source items;
- many-to-many relations rather than exclusive categories;
- plain Swiss/pragmatic interface vocabulary;
- shadcn/Base UI-style libraries provide behavior, not visual identity;
- Watch should remain a resource/monitoring system rather than collapse into a news website.

---

# 15. Immediate next implementation target

Before map work:

1. lock `/run` and internal endpoints;
2. correct the source-scope relevance bug;
3. clean the already-published non-Papua Developments;
4. implement 14-day backfill;
5. run the backfill through the request-budgeted pipeline;
6. populate a useful recent Development set;
7. introduce key points;
8. separate lead Reports from `More Developments`;
9. start D1-backed Issues + many-to-many relations;
10. add canonical Places.

Then begin Freeze 10 PMTiles/map work.

---

# 16. Final product shape

The intended system is:

```text
                         WEST PAPUA WATCH

                               Place
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
        Issues                History                Resources
          │                      │                      │
          └──────────┬───────────┴───────────┬──────────┘
                     │                       │
                Developments             Exhibition
                     │                       │
                   Reports                  Events
                     │
                   Current

                              Map
                     renders spatial context

                              Ask
                  retrieves across the system
```

The map is not the database.

The newsroom is not the whole product.

The LLM is not the source of truth.

The design should make the relationships obvious through navigation, proximity, geography, provenance, and good typography rather than explaining the architecture to the reader.

---

## Canonical one-line summary

**West Papua Watch connects current reporting, persistent dossiers, public data, geography, history, resources, events, and cultural material in one provenance-aware public reference system.**
