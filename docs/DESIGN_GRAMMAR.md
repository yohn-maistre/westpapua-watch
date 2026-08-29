# West Papua Watch — Design Grammar & Component Backbone

**Status:** design exploration / implementation guidance  
**Date:** 2026-08-28

## Executive recommendation

Do **not** use vanilla shadcn/ui as the visual language.

Use it as **accessibility and interaction plumbing**, then build a site-specific editorial system on top.

The current strongest stack is:

```text
Astro
+ React islands only where interaction needs them

Tailwind CSS / project CSS tokens
+ site-specific layout primitives

shadcn/ui with Base UI
→ command, dialog, drawer, tabs, accordion, tooltip, etc.

shadcn/typeset
→ long-form pages, resources, Markdown, agent responses

21st.dev / shadcn MCP
→ agent-readable component discovery, not visual authority

Motion for React + native CSS
→ ordinary motion and micro-interactions

GSAP ScrollTrigger
→ only for authored History sequences that need complex pinned choreography

Astro View Transitions
→ lightweight continuity between routes

React Bits / Motion Primitives / similar registries
→ selective source-code donors for one-off effects
```

The important distinction is:

> **Component system ≠ design system.**

Shadcn can give us excellent behavior. It should not decide what West Papua Watch looks like.

---

## 1. Proposed design grammar

The best working direction is a **modern editorial / investigative interface** with strong cultural-institution discipline.

Not a newspaper clone.  
Not an NGO template.  
Not a dashboard.  
Not a faux archive.

### The visual system should feel

- precise;
- contemporary;
- serious;
- image-aware;
- typographically confident;
- restrained in chrome;
- occasionally cinematic;
- highly readable;
- materially connected to maps, documents, photographs, and artwork without pretending the whole UI is literal paper.

### Core visual objects

Instead of designing from generic `Card`, `Badge`, and `Section` components, design from the site's actual content objects:

```text
Development
Issue
Update
Source
Document
Map
History moment
Event
Exhibition work
Ask result
```

These should become the real component vocabulary.

---

## 2. Layout grammar

### Use a strong editorial grid

A 12-column desktop grid gives enough flexibility for:

- full-bleed images;
- narrow reading columns;
- metadata rails;
- offset headlines;
- side notes;
- source lists;
- asymmetric story layouts.

Mobile should collapse into a simple single reading flow rather than preserving desktop cleverness at all costs.

### Prefer rules and space over boxes

Default separation should come from:

- whitespace;
- 1 px rules;
- alignment;
- changes in type scale;
- image boundaries;
- controlled background shifts.

Use a bordered/filled container only when the content genuinely behaves as a discrete object.

### Radii

Keep radii low and purposeful. Media can have modest rounding. Utility surfaces can have slightly more. Do not make the entire site look inflatable.

### Overlap

Allow photographs, maps, captions, and documents to break the grid selectively on story-driven pages. Do not use overlap in the resource library or dense information surfaces where it harms scanning.

---

## 3. Typography grammar

Typography should do more work than decorative UI.

### Working structure

- **Interface / metadata face:** contemporary sans or grotesk.
- **Long-form / editorial face:** readable serif, potentially also used for major story headlines.
- **Optional mono:** only for dates, document IDs, source metadata, coordinates, or system/agent details where it adds structure.

Do not freeze specific families yet.

Good current directions to test:

- Newsreader + Inter / Inter Tight;
- Source Serif 4 + Public Sans;
- Literata + Manrope;
- a strong sans-only direction with serif reserved for long reading.

### Rules

- two primary font families maximum at launch;
- subset weights aggressively;
- use optical sizing where variable fonts support it;
- keep body measure controlled;
- use larger body type on mobile than many editorial sites do;
- do not use all-caps for long labels;
- metadata can be smaller but must remain comfortably readable on cheap phone screens.

### shadcn/typeset is unusually relevant

In July 2026 shadcn released `typeset`, a single owned CSS file for rendered HTML/Markdown with configurable size, leading, and flow. It is designed for both long-form reading and streaming chat.

That is a very good match for this project because the same content system needs to render:

- history prose;
- issue dossier text;
- resource metadata;
- Markdown mirrors;
- Ask responses while they stream.

Use it as a starting rhythm system, then customize the CSS until it no longer looks generic.

---

## 4. Color grammar

Do not make category colors the skeleton of the interface.

The earlier direction remains useful:

- navigation mostly neutral;
- active states primarily via weight, underline, inversion, or position;
- color comes from photography, maps, artwork, campaign imagery, and occasional signal states.

### Working palette strategy

Design the site around:

- one light or dark base;
- ink/text hierarchy;
- one restrained signal accent;
- image-derived color where appropriate.

Do not launch with a color system that needs six categorical hues merely because six sections exist.

### Dark mode

Do not automatically add a theme toggle for launch. One extremely well art-directed theme is preferable to two mediocre ones.

If a dark-first `Now` direction proves substantially better, make that an art-direction decision rather than a component-library default.

---

## 5. Motion grammar

Awwwards-quality motion is usually about timing, hierarchy, and continuity, not about the number of animation packages installed.

### Three levels

#### Level 1 — CSS

Use native CSS for:

- hover/focus transitions;
- basic reveals;
- small image transforms;
- simple marquees if genuinely required;
- sticky positioning;
- responsive transitions.

#### Level 2 — Motion for React

Use Motion for:

- shared-layout transitions;
- scroll-linked transforms;
- interactive panels;
- command/Ask transitions;
- list rearrangement;
- controlled text/image reveals;
- gesture-aware interactions.

Motion's current scroll API can use browser scroll timelines for some effects, which is valuable for smoothness and reduced main-thread work.

#### Level 3 — GSAP ScrollTrigger

Reserve GSAP for the History page or similarly authored sequences where we genuinely need:

- pinned scenes;
- long timelines;
- carefully synchronized map/document/photo changes;
- precise entry/exit choreography across many elements.

Do not load it site-wide merely because Awwwards sites often do.

### Native scroll first

Do not install Lenis by default. Native scrolling is fast, predictable, and accessible. Add a smooth-scroll layer only after testing demonstrates that it materially improves a specific experience without making low-end devices worse.

---

## 6. Page-specific visual behavior

### Now

The layout should be editorial and immediately scannable.

Borrow the useful idea from Particle: many source articles resolve into one visible development.

But avoid copying Particle's colorful card wall literally.

Possible grammar:

- one dominant current development;
- 2–4 strong secondary developments;
- a compact latest-updates stream;
- source count and update time as visible metadata;
- images used as editorial anchors, not card thumbnails by default;
- issue links integrated into each development.

Animation can make the leading development settle into the feed as the visitor begins scrolling.

### Issues

More stable and document-like than Now.

Use:

- strong title block;
- current-status summary;
- update timeline;
- a compact source rail;
- linked history;
- key documents;
- clear version/update metadata.

This should feel maintained, not auto-generated.

### History

This is the showpiece.

Use a small number of reusable narrative primitives rather than a single gimmick:

- `PinnedStage`
- `MapState`
- `DocumentFocus`
- `PhotoFocus`
- `TimelineMarker`
- `SourceAnnotation`
- `ChapterBreak`

A chapter can choose whichever primitive makes the content clearest.

### Resources

Dense, fast, quiet.

Avoid large cards. Use compact rows/tables/listing patterns, good filters, excellent search, and small thumbnails only where they improve recognition.

### Events

Treat events more like a cultural programme than SaaS event cards. Dates, cities, venues, and names can become the typographic structure.

### Exhibition

Let the work dominate. The site's chrome should almost disappear.

### Ask

Treat the Ask surface as an extension of the site's editorial navigation, not as a separate visual product.

Desktop: command surface / centered palette.  
Mobile: bottom sheet or full-height panel.

---

## 7. Component backbone: what to use

### shadcn/ui + Base UI — **yes, underneath**

As of July 2026, Base UI is shadcn/ui's default base for new projects. Base UI is stable and shadcn keeps the source local and editable.

Use it for behavior-heavy components:

- Command / combobox;
- Dialog;
- Drawer / Sheet;
- Accordion / Collapsible;
- Tabs;
- Tooltip;
- Popover;
- Dropdown/Menu where necessary;
- form controls;
- accessibility/focus primitives.

**Do not** use default `Card`, `Badge`, `Button`, and dashboard blocks as the design grammar.

We can still reuse their code, but restyle them radically.

### 21st.dev — **best discovery layer for agents**

21st currently indexes more than 12,000 React components/templates/themes and publishes in shadcn-compatible registry form. Components can be pulled through agent tooling/MCP rather than hand-copied.

Use it like a visual parts catalogue:

1. ask the agent for 3–5 candidates for a very specific interaction;
2. preview them;
3. choose one;
4. install/copy source;
5. strip its theme assumptions;
6. normalize it to our tokens;
7. keep the resulting component in our repository.

Do **not** let the agent randomly collect components from ten authors on the same page.

### React Bits — **selective motion donor**

React Bits currently offers a large set of animated React components and effects with source copied into the project, including shadcn-registry installs.

Good for:

- one unusual text reveal;
- one image treatment;
- one cursor or hover behavior if appropriate;
- one background treatment where content allows it.

Bad for:

- defining the whole site;
- stacking multiple novelty effects;
- anything that compromises load time or legibility.

### Motion Primitives — **small movement vocabulary**

Useful when we want compact motion primitives rather than finished sections.

The library has been quieter recently, but because source is copied locally this is not a runtime dependency risk. Treat it as reference/source material, not a foundation.

### Origin UI — **utility expansion only**

Useful if shadcn's basic utility components need better real-world variants.

It is not an editorial design direction. Keep it for forms, dialogs, upload controls, pagination, or admin surfaces.

### Tailark / generic marketing block libraries — **mostly no**

These are useful for conventional marketing pages. They are unlikely to create the editorial identity we want and can pull the site toward generic landing-page composition.

Borrow only unusually strong individual structures.

---

## 8. The strongest agent workflow

The 2026 shadcn registry/MCP ecosystem makes it practical to have agents search registries directly. Use that capability, but put a design gate in front of it.

### Proposed rule for coding agents

Before adding a new externally sourced visual component:

```text
1. Describe the design problem.
2. Search approved registries.
3. Return 3 candidates with trade-offs.
4. Prefer the simplest candidate that achieves the intended effect.
5. Install source into the repo.
6. Normalize typography, spacing, radius, color, focus states, reduced motion.
7. Run the page at mobile width and low-motion mode.
8. Keep or delete. Never leave a half-themed component behind.
```

This is more important than the choice of registry.

### Build our own local registry

A particularly strong move is to turn the project's approved primitives into a **project-local shadcn registry**.

Shadcn now supports GitHub source registries and MCP-compatible registries, including private repositories as of August 2026.

Over time we can maintain approved items such as:

```text
@wpw/development-card
@wpw/source-row
@wpw/issue-header
@wpw/history-stage
@wpw/history-document
@wpw/event-row
@wpw/exhibition-work
@wpw/ask-surface
@wpw/typeset
@wpw/motion-tokens
```

Then Codex does not need to rediscover the design language every session.

The project's own registry becomes the first place agents search. External registries become inspiration and donor sources.

---

## 9. Token system

Keep the token layer small enough that a human can understand it.

### Core tokens

```text
color
  bg
  surface
  ink
  muted
  rule
  accent
  inverse

space
  page
  section
  block
  inline

layout
  max-page
  max-reading
  max-wide
  grid-gap

radius
  small
  media
  overlay

motion
  fast
  normal
  slow
  ease-standard
  ease-enter
  ease-exit

z
  content
  sticky
  overlay
  command
```

Avoid fifty semantic color aliases before we have fifty semantics.

---

## 10. Proposed visual primitives

Build these before generic section components:

### `DevelopmentFeature`
Large current development with image/map, source count, update time, synthesis, issue link.

### `DevelopmentRow`
Compact current-development item.

### `SourceStack`
Shows source logos/names/count without turning them into decorative pills.

### `IssueHeader`
Stable dossier identity, update status, current summary.

### `UpdateTimeline`
Recent developments attached to an issue.

### `ResourceRow`
Dense source/resource listing with metadata.

### `HistoryStage`
Sticky/pinned shell for narrative sequences.

### `DocumentFrame`
Document crop, metadata, source link, accessible alt/context.

### `MapFrame`
SVG-first map with annotated state changes.

### `EventRow`
Date/city/name/venue as typographic hierarchy.

### `ExhibitionWork`
Media-first presentation preserving the work.

### `AskSurface`
Command/search/chat hybrid.

---

## 11. Quality bar for every page

Before calling a page done:

- Does it have one unmistakable visual hierarchy?
- Are there fewer boxes than the first implementation attempt?
- Could at least one generic container be replaced by spacing/alignment/rules?
- Is the main photograph or artwork treated intentionally?
- Do motion and layout still make sense with reduced motion?
- Is the mobile layout designed, not merely collapsed?
- Is typography carrying enough of the identity?
- Does it look like this project's site rather than a library demo?
- Can a visitor understand the page without instructional microcopy?
- Did we inspect it at a low-end-phone viewport and network profile?

---

## 12. Current component-backbone decision

If coding started today:

```text
FOUNDATION
Astro + Tailwind/CSS tokens

INTERACTIVE PRIMITIVES
shadcn/ui on Base UI

LONG-FORM + STREAMING TYPOGRAPHY
shadcn/typeset, heavily customized

DISCOVERY FOR AGENTS
21st.dev + shadcn MCP

STANDARD MOTION
CSS + Motion for React

SCROLL STORYTELLING
GSAP ScrollTrigger only in authored History sections

ROUTE CONTINUITY
Astro View Transitions

SELECTIVE VISUAL DONORS
React Bits / Motion Primitives / carefully chosen registry items

PROJECT SOURCE OF TRUTH
our own local components + eventually our own shadcn registry
```

This gets us the best part of shadcn without accidentally shipping shadcn.com with different copy.

---

## Research notes, August 2026

- shadcn/ui made Base UI the default for new projects in July 2026 and continues to support Radix and React Aria.
- shadcn's MCP can browse/search/install from compatible registries, including namespaced registries.
- shadcn introduced GitHub registries in June 2026 and private GitHub registries in August 2026.
- shadcn/typeset launched in July 2026 for HTML/Markdown typography and streaming content.
- 21st.dev currently presents 12,000+ community React components/templates/themes in shadcn-compatible form and supports agent-driven installation.
- Motion for React exposes scroll-linked/scroll-triggered APIs and reduced-motion support.
- Astro provides native View Transitions with fallbacks and reduced-motion handling.

Primary references:

- shadcn/ui changelog and MCP/registry documentation
- shadcn/typeset documentation
- 21st.dev catalogue and MCP guidance
- Motion for React scroll documentation
- GSAP ScrollTrigger documentation
- Astro View Transitions documentation
- React Bits / Motion Primitives / Origin UI catalogue pages
