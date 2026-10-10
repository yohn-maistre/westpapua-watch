# History editorial expansion — 10 October 2026

The live reader uses `content/history-reading.json`, through `src/data/history-reading.ts` and `src/views/HistoryPrototypeView.astro`. The older history and explorer files supply IDs and related catalogue information; every reading account now has explicit bilingual paragraphs and paragraph-level supporting URLs in the reading file.

## Structure

- 43 chapters, 39 on the default Timeline / Linimasa path, 75 accounts across all paths.
- One global path selector. Arrows change the local chapter perspective and leave the global path unchanged. Existing record anchors and browser Back remain supported.
- Added main periods: resistance in 1965–1971; border crossings and political networks in 1984–1988; Yosepha Alomang and Amungme land in the 1990s–2001; political fronts and dialogue in 2008–2011; Paniai and accountability; Kiwirok, displacement and care.
- Added local perspectives: church institutions, Kobe Oser, Amungme court filings, Wasior/Wamena investigations, Mimika health infrastructure and aerial-attack investigations.
- Theys Eluay's killing is in the 2001 account rather than extending a chapter labelled 1998–2000.
- Source anchors derive from URLs rather than their positions. References appear beside relevant paragraphs; numbered source rows remain visible. Detailed image provenance stays in the archive viewer.

## Evidence decisions

| Area | Basis | Editorial treatment |
| --- | --- | --- |
| 1949–1961 organising, Council and manifesto | Richard Chauvel, *Constructing Papuan Nationalism* (2005), especially pp. 11–35; Council archive photographs | Named Papuan actors and different political choices, rather than a solely Dutch/Indonesian dispute. |
| OPM and competing networks | IPAC, Report 21 (2015); Elmslie, Webb-Gannon and King (2011) | Distinguish political fronts, armed commands and diplomatic bodies. Avoid implying one uninterrupted command structure. |
| Kobe Oser | Huygens ING document 4430, 6 February 1962; Nationaal Archief inventory 347035, 9 May 1969; PACE catalogue | Primary records establish a student association and later petitioning. No unsupported current membership claims. |
| Border crossings and exile | Rosemary Preston (1992); Diana Glazebrook (2001); Chauvel on Wanggai | Refugees' local and political experiences, without using a single unqualified population estimate. |
| Churches | GKI institutional history; MURAI/STFT Kijne study (2024), DOI 10.58983/jmurai.v5i2.146; Benny Giay (1995); Neles Tebay interview (2010) | GKI, Kingmi and Catholic institutions have distinct histories. Include Papuan religious initiative, consultations and public roles. |
| Mama Yosepha | Goldman Prize recipient profile; Abigail Abrash in Cultural Survival | Documented organising, detention, livelihoods and Amungme/Kamoro land relationships. Do not transfer historical profile statistics to the present. |
| 2009–2010 litigation | Jakarta Globe/ETAN, 17 July 2009; BBC Indonesia, 9 March 2010 | Filings and compensation demands are not successful awards. Earlier environmental litigation is a separate case. A personal lead on participants remains uncorroborated and is not published. |
| Mimika healthcare | RSMM institutional history; LPMAK sustainability report (2019) | Explain institutions and responsibilities without treating service provision as resolution of environmental claims. |
| Paniai | BBC (March 2022), Komnas HAM findings reported there; LBH Papua statement following December 2022 acquittal | Investigation, prosecution and judgment are distinct. Acquittal of one defendant is not exoneration of every actor or denial of documented deaths. |
| Wasior/Wamena | VOA reporting on Komnas HAM (2016) | Local accountability perspective; no unsupported current prosecution status or casualty total. |
| Kiwirok | Jubi and Kompas (September 2021); Human Rights Monitor (August 2023); UN experts (March 2022) | Report the health-centre attack, nurse's death and TPNPB spokesperson's denial; separately attribute subsequent military raids and the investigation's legal assessment. |
| Aerial attacks and weapons | *Paradise Bombed*, *Frontier War* reporting; HRM; ABC (2018); UK written answer HL4760 (2025); HRW (May 2025) | Documented civilian harm and reported aerial attacks are separate from disputed identification of munitions. Do not present chemical-weapons allegations as established findings. The UK answer addresses earlier allegations and does not independently identify every object in the later film. |
| Leaked military documents | *Anatomy of an Occupation* (2011) | Evidence of classification and monitoring, not proof that every listed civilian was an armed-group member. Do not reproduce private profiles from military lists. |

The remembered smaller organisation with a green flag and a star has not been reliably identified. Wanggai's 1988 West Melanesia initiative is documented independently; it is not equated with that unconfirmed lead.

## Media

Every displayed mosaic item belongs to the canonical archive catalogue and bottom gallery. Selections are explicit at chapter/perspective level; related catalogue IDs no longer automatically determine the mosaic. Films open from their selected stills rather than appearing again as separate rows below the prose. Unselected media remain available in the gallery.

Added historical/source media: Tanahmerah barracks (KITLV 400106, album A1243, Leiden item 899426); historical Sentani bark cloth (NGA accession 1985.1870); Goldman Prize portrait of Yosepha; original covers of the 2011 occupation report and 2023 Kiwirok investigation; existing Amsterdam Council photograph added to the canonical gallery.

The first Digoel candidate, KITLV 153802, primarily showed landscape and was replaced with the verified barracks image. The Mansinam candidate from Onsland returned the annotated reverse of the photograph; related front images concerned different records. It is not displayed as the monument. There is no compulsory filler when a suitable illustration is unavailable.

Three Watch schematics are removed from the displayed catalogue. Original scholarly figures remain attributed to their publications. Named contemporary-maker photographs remain in Exhibition rather than illustrating an earlier historical period.

## Performance and verification

Local previews are committed; `scripts/build-history-previews.py` is an editorial maintenance command requiring Pillow, not a CI build dependency. It generates 320/640/960-width candidates when the original supports those sizes. Document dimensions are preserved. Full-size viewer images and film playback load on demand; closing the viewer releases its media elements.

The desktop margin moves the existing mosaic node between its account and the margin instead of cloning it at each crossing. A closed mobile map receives no pin DOM updates. WebGL still activates only when explicitly expanded. Resize callbacks rebuild the chapter observer only when its geometry or visible chapter set changes. Automatic URL updates wait briefly for a settled chapter; explicit navigation updates immediately.

Before/after mobile Chromium scroll sampling at 390×844 with 6× CPU throttling: ordinary reading had zero WebGL canvases in both samples. Atlas DOM mutations fell from 94 to zero with the map closed. Loaded History image pixel area fell from approximately 58 MB to 10 MB in the sampled sweep; this is decoded-pixel-area estimation, not measured process RAM. The enlarged history contains more source rows and accounts, and the later sample still recorded short long tasks. These results do not establish physical Samsung A12 performance or prove every possible scroll pause is gone.

Validation covers bilingual paragraphs, supporting URLs, stable citation anchors, edited mosaic limits, every selected visual's catalogue membership, preserved specialist accounts, deep links, local/global controls, Back, visible reference targets, enlarged mobile text, atlas notes, viewer opening/release and desktop mosaic reuse. The production build and existing content, explorer, polish and system suites must pass before deployment.

Final local verification: production build (352 pages), content checks, archive validation (77 items), explorer, polish and system suites passed. Browser checks passed in English and Indonesian at 390×844, including enlarged text, and at 1440×1000 for desktop mosaic reuse. No browser script errors occurred in those interaction checks. The sticky control overlapped the compact navbar edge by one pixel, avoiding a visible sliver. Deployment verification is recorded in GitHub Actions for the resulting commit.
