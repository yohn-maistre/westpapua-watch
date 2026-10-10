# History: Papuan editorial revision — research and proposal

Prepared 10 October 2026 against live commit `538579c`. This is a research and editorial proposal, not a change to the deployed reader.

## Direction

Political history should become the first reading path. Each path should have an authored sequence and each account one primary home. Remove the mixed Timeline / Linimasa from the selector rather than retaining two competing default histories. Preserve the current reader: mosaics, local perspective arrows, inline references, visible source rows, static atlas, archive gallery and compact navigation.

The editorial position is Papuan: people exercising self-determination, organising, protecting land and surviving state violence are the subjects of the history. Write documented coercion, killings, torture, displacement and military attacks directly. Indonesian government terminology and justifications should be attributed when they explain a decision or dispute. They should not supply the narrator's default vocabulary.

The central content problem is substantive. Several accounts describe the existence of a report instead of narrating its evidence. For example, the current 1977–1978 account uses most of its 82 English words to discuss reconstruction and methodology; the report itself contains locations, aircraft, witness accounts, named victims and the consequences of flight from villages. The current MIFEE account spends its second paragraph distinguishing successive programmes, leaving little space for the Malind communities it is supposed to describe.

## Audit and research scope

- Code ground truth: `content/history-reading.json`, `src/data/history-reading.ts`, `src/views/HistoryPrototypeView.astro`, and `src/lib/history-prototype.ts`.
- Current reader: 43 chapters, 75 accounts, seven overlapping paths. Political currently includes 31 chapters and starts with regional social authority. The `all` path is the server and client default.
- Actual account text was audited from `paragraphs`, not inferred from the older prototype body. Most substantive English accounts are roughly 70–175 words. Seven records contain only 8–13-word photo captions.
- This pass used Exa for 21 targeted searches, 141 result slots and 123 distinct returned URLs. Search hits were candidates, not 123 independently validated claims. Full page/PDF fetches, local PDF extraction and selected passage checks were used for the strongest sources.
- Original PDFs retained locally: AHRC/ICP 1977–1978 investigation, ELSHAM/ICTJ 2012, ELSHAM Biak report, Musgrave's legal analysis and the complete 76-page MIFEE field report. Research discovery and fetch transcripts are in `/workspace/scratch/history-papuan-editorial-research-2026-10-10/`.
- Existing sources from the preceding pass remain useful: Chauvel, IPAC, ANU's 2025 history collection, Mansoben, Benny Giay, Pusaka's Merauke chronology, Yosepha Alomang's Goldman profile, and the Kiwirok investigation.

Companion files:

- [Account ownership proposal](history-path-ownership-proposal-2026-10-10.csv): all 75 current accounts, current paths, proposed home, word count and editorial action.
- [Evidence matrix](history-papuan-editorial-evidence-2026-10-10.csv): 15 event/period groups, publishable detail, source basis, locators and unresolved specifics.
- [Writing samples](history-papuan-editorial-samples-2026-10-10.md): bilingual drafts for Pepera, the highlands campaign, Biak and MIFEE. These demonstrate the proposed voice; they are not yet production content.

## Five reading paths

| Order | English / Indonesian | Scope | Current account allocation |
| --- | --- | --- | --- |
| 1, default | Political history / Sejarah politik | Sovereignty, colonial administration, self-determination, independence organising, state violence, public institutions and accountability | 32 |
| 2 | Peoples & societies / Masyarakat & adat | Languages, contact, regional authority, customary relationships, exchange, schooling, church institutions, care and health | 12 |
| 3 | Culture & knowledge / Budaya & pengetahuan | Making, performance, noken, khombouw, collections, Mambesak and transmission of knowledge | 6 |
| 4 | Land & livelihoods / Tanah & penghidupan | Gardens, sago, concessions, mining, agribusiness, court claims and food/energy programmes | 8 |
| 5 | Early settlement / Masa awal | Landscape and Sahul, settlement evidence, coastal change, archaeological sites, pottery and rock art | 10 |

These counts are existing accounts allocated for editing, not promised final card counts. Seven photo-only records become media captions, retaining their assets, provenance, gallery entries and legacy link destinations.

“Masyarakat & adat” is a compact menu label. The path's remit includes modern institutions and care as well as customary society; a longer description belongs in the selector's optional context line, not repeated above every account.

Political history can open with a short account of western coastal relations with Maluku and Tidore, then Dutch claims and administration. Do not put the full comparison of ondofafi, tonowi, bobot and other regional authority systems in front of that sequence. Its proper home is Peoples & societies, with a quiet link from the political opening where relevant.

Different paths may share a date, person or institution. They must not repeat the same account or paragraphs. For example:

- Land owns the detailed Freeport contract/concession account. Politics places the contract briefly in the pre-Pepera sequence and links to it.
- The institutional origins of GKI and other churches belong in Societies. Their role in FORERI, the Tim 100 delegation and dialogue belongs in those specific political episodes.
- Culture owns the full Mambesak/Arnold Ap account. The political 1984 period links to it without duplicating the entire account.
- Politics owns Yosepha Alomang's organising and state repression. Land links to her account from the mining history and explains its own environmental and concession evidence.

The result should be separate reading journeys, not an assertion that culture, land and politics were historically unrelated.

## Political sequence to author

Use dated chapters with a main account and, where needed, local perspectives within the same path. Do not make each organisation, victim or report a separate card.

| Period | Main narrative | Local perspectives / connected accounts |
| --- | --- | --- |
| Before permanent Dutch administration | Western coastal authority and Maluku/Tidore connections; the reach and limits of external claims | Link to regional social authority rather than repeat it |
| 1828–1902 | Fort Du Bus, the limits of the early Dutch foothold, later stations and administration in the south | Named places and Papuan experiences of administration; mission detail in Societies |
| 1927–1945 | Boven Digoel, Koreri, Japanese occupation and the Pacific war on Papuan land | Distinct dated accounts, with local agency and consequences beyond military arrival |
| 1949–1961 | West New Guinea excluded from the sovereignty settlement; education, Papuanisation, parties, Council and manifesto | Papuan leaders and constituencies; diaspora/Kobe Oser rather than a solely Dutch–Indonesian dispute |
| 1961–1963 | Trikora, incursions, Cold War diplomacy, the New York Agreement, UNTEA and transfer | Explain whose representatives participated and whose decision-making was excluded |
| 1963–1969 | Restrictions on political activity, OPM's emergence, Arfai and counterinsurgency before Pepera | Operation Sadar; Sampari teachers; detention of former Council member Baldus Mofu; named locality rather than generic conflict |
| 1969 | Pepera: selection, confinement, threats, assemblies, UN role and diplomatic acceptance | Papuan witness accounts and petitions; exact representative-count question kept in the editorial ledger until resolved |
| 1971–1978 | Republic proclamation and diverging independence networks; escalation in the Central Highlands | 1977–1978 village attacks, aerial bombardment and deaths during displacement; do not bury these in a methods paragraph |
| 1984–1988 | Refugees, border organising and political networks | Link to the Mambesak account; include West Melanesia where the evidence explains its role |
| 1994–1997 | Timika-area abuses, Amungme organising and Yosepha; Mapenduma hostage crisis and military operations | Distinguish 1994–1995 killings, May 1996 rescue, Geselema civilian attack and subsequent village operations |
| July 1998 | Biak Berdarah | Gathering, attack, detention/torture, missing people, bodies and families' demand for truth; its own main account |
| 1999–2000 | FORERI, Tim 100, Mubes, Congress and the Presidium's political programme | Explain what was demanded, the state's response and the shift from opening to repression; Abepura is a distinct dated account |
| 2001–2003 | Theys Eluay's killing, special autonomy, Wasior and Wamena | Local accounts distinguish the murder, policy settlement, police reprisals and army sweeps; sources and aftermath attached to each |
| 2008–2014 | KNPB and other fronts, dialogue initiatives, civilian organising and ULMWP formation | Name TPNPB's independence purpose and the different armed commands where relevant; avoid implying one unified command for all organisations |
| 2014–2022 | Paniai: civilian protest, shooting, investigation, prosecution and acquittal | Explain the limited prosecution and dissenting judges; a later accountability outcome must not obscure the 2014 event |
| 2018 onward | Nduga attacks and military operations; civilian flight, interrupted schooling, food and care | Its own starting point and chronology, rather than only a paragraph on weapons allegations |
| 2019–2022 | Anti-racism mobilisation, repression, internet shutdown judgment, autonomy revision and new provinces | Date each event; explain the decisions and practical outcomes rather than just list laws |
| 2021 onward | Kiwirok, attacks on healthworkers, subsequent military attacks on settlements, displacement and renewed aerial warfare | Accounts of affected Ngalum communities; verified satellite evidence; dated 2025 reporting; distinguish a weapon identification from evidence of civilian harm |

The sequence is an outline, not an exhaustive list of every documented abuse. Further cases require their own source checks. Do not claim to have compiled “all bombings” from this pass. Prioritise the well-supported missing periods before adding long unverified catalogues.

## Evidence and attribution decisions

### Pepera

Saltford's archival research, Musgrave's legal analysis and the US National Security Archive support explicit description of a controlled process: selected representatives, confinement, intimidation and an outcome that diplomats expected in advance. These are not merely present-day Papuan objections to an otherwise free vote.

Papuan Voices identifies Mama Rosa Tambaib and Elias Yos Moiwend as witnesses in its 2011 film. Socratez Sofyan Yoman's article supplies Papuan testimony and discusses military documents. The film page was inspected but the video was not transcribed in this pass. Do not place exact spoken quotations in the reader until the original recording is checked.

Gun threats should be tied to the specific account. Saltford describes an armed threat against a UN worker trying to attend a rally; Yoman reports Hugh Lunn being threatened with a weapon while photographing a demonstration. These are evidence of armed intimidation around the process, not a licence to invent an identical experience for every representative. Participant isolation and death threats can be stated with their own evidence.

Published totals of representatives differ: the current reader says 1,026; Saltford/Musgrave use 1,022; other accounts distinguish selected and participating representatives. The exact original UN report was not recovered as readable text here. Draft with “around a thousand” / “sekitar seribu” until the categories are reconciled. The issue is not material to the established exclusion of the general adult population.

The General Assembly resolution's “takes note” wording and diplomatic acceptance need accurate explanation. Do not turn it into a statement that the UN conducted or certified a popular referendum, or an unsupported claim that the UN legally nullified the entire process.

### Earlier operations and bombing

ELSHAM/ICTJ's 2012 report gives new usable detail for the Manokwari/Sorong/Biak period before Pepera: Operation Sadar, burned villages, aerial attacks, civilian teachers, repeated detention and torture. Use the locations and witnesses. Public historical figures can be named; protected interviewees remain anonymous.

AHRC/ICP's 2013 report gives concrete material for the 1977–1978 campaign: aerial bombardment, ground attacks and the consequences of displacement. Its list of 4,146 names must remain described as the report's collected list. Other estimates overlap and cannot be summed. Napalm and cluster-munition accounts have specific evidentiary chains; the proposed reader should not turn them into a blanket identification of every bomb.

“The Neglected Genocide” is the investigation's title and assessment. Keep that title in Sources; legal characterisation should be attributed where used in the prose. This does not require weakening the description of killings, torture and attacks on villages.

### Kopassus and Prabowo

Prabowo's leadership of the 1996 Mapenduma rescue is supported by contemporary reporting. Mark Davis's investigation and the later report in Le Temps supply civilian accounts and the controversy around the helicopter assault on Geselema. Le Temps reports the findings of an ICRC-commissioned inquiry in March 2000; the original inquiry was not obtained here. Use that attribution rather than pretending it has been read firsthand.

Command position, an allegation of ordering an act, and a finding of individual criminal responsibility are separate claims. Explain the command role that is documented. Do not assert a personal order or presence at a killing without supporting evidence. No basis was found in the material reviewed to attribute Biak directly to Prabowo. Likewise, the Theys murder convictions concern the officers and soldiers identified in that case; they are not evidence that a former Kopassus commander ordered it.

Also distinguish institutions. Wasior's Brimob/police evidence should not be labelled an army operation simply because the wider history concerns Indonesian state violence.

### Biak and accountability

The ELSHAM report was produced with GKI, GKII and Catholic Church participation. It contains concrete accounts of the attack, hospital restrictions, bodies withheld from families, detention and torture. Its summary separately lists eight killed, three disappeared, wounded/detained people and 32 unidentified bodies. Do not add those categories into a confident final death toll. HRW's contemporary account and later witness material supplement it.

The 2013 citizens' tribunal is relevant historical testimony and a public demand for accountability. Identify its status accurately; it was not an Indonesian criminal court. Different reported military battalion numbers require checking before publication.

For Paniai, the 2020 Komnas HAM statement is an original institutional source, and the 2022 court reporting includes dissent by two judges. Explain that the single accused was acquitted and what the limited prosecution left unaddressed. Do not waste a closing paragraph teaching readers abstract legal distinctions. Appeal status and the exact inquiry victim list need a final check before describing today's position.

### Recent conflict and weapons

Give Nduga a proper sequence from 2018, including deaths that triggered the operations and the civilian consequences that followed. The UN communication summarises information received, so its particular allegations require attribution. Kiwirok has a separate HRM investigation using interviews and satellite imagery. Neither should be reduced to whether a film has identified a particular weapon.

Independence identity can be named clearly: “Tentara Pembebasan Nasional Papua Barat (TPNPB), yang memperjuangkan kemerdekaan Papua Barat…” / “TPNPB, the West Papua National Liberation Army, fighting for West Papuan independence…”. Describe specific commands and actions instead of replacing the name with an anonymous “armed group”. Do not import “KKB” or “terrorists” into the narrator's vocabulary.

Documented attacks on healthworkers and other civilians remain part of the history. A Papuan perspective includes what civilians experienced and how independence organisations responded; it does not require hiding that evidence.

White-phosphorus or other chemical-weapon identifications remain source-specific disputed claims. Direct evidence of destroyed civilian settlements, injuries and displacement can be described without resolving every weapon claim. Current sources must carry their date; a May 2025 report cannot silently stand for the whole period to October 2026.

## Writing method

Give each account a beginning and an outcome. Readers should be able to identify the actors, place, decision or action, civilian experience and what followed without leaving the page. Use sources to establish those facts, not to stand in for the narrative.

Complex accounts can use four to six short paragraphs, with additional local perspectives when the material is genuinely separate. There is no fixed word limit. Longer treatment is warranted for the transfer/Pepera sequence, bombing campaigns, Biak and the autonomy/accountability period. Shorter accounts remain short when the available evidence does not support further detail.

End on the event's result: a political institution created or closed, families displaced, a prosecution that failed to reach further perpetrators, a livelihood changed, or a decision carried into the next period. Do not invent causation simply to smooth a transition.

Remove routine endings such as “these sources help readers understand…” and repeated distinctions about what a report is not. Necessary limits belong next to the relevant figure or claim, in one brief attribution. Details of method and unresolved leads belong in the editorial ledger or original source.

The ID version should read naturally on its own. Keep agency visible: “aparat menembaki warga”, where established, rather than an unexplained “kekerasan terjadi”. Avoid ornamental titles or repeated slogans. Existing simple names—Pepera, Biak Berdarah, Boven Digoel—work well.

## Sources, visuals and navigation

Inline numbers remain beside the relevant sentence or paragraph. Keep the source rows visible underneath, deduplicate each URL and retain stable URL-derived anchors. Do not bring back a detached strip of reference numbers or a source expander.

Keep the current mosaic and archive relationship. Selected historical photographs and document images give context inside the account and also belong in the gallery. New report imagery should be useful evidence or orientation, not a required cover pasted into every card. Contemporary named makers and performances stay in Exhibition when that is their proper home.

The global dropdown chooses the reading path. Local arrows choose another account/perspective in that period **within the selected path**. The current implementation cycles all chapter panels, including panels from other paths, so that behaviour must be tightened during implementation. Do not add global path arrows or an extra top index.

Separate editorial ownership from topic tags. Add explicit path membership/order to the reading data; keep broad tags only for search and related material. On opening a legacy record or reference link, reveal its owning path and local panel. Treat an old `path=all` without a specific record as an alias of Political history. Keep language switching, source hashes and browser Back working.

## Implementation order and checks

1. Use the concrete outline/samples for the user's requested research-and-plan review, then implement the path data and default together in the implementation pass.
2. Rewrite the political sequence, adding the strongest missing cases and expanding existing thin accounts. Check adjacent dates, beginnings/endings, independent source basis and the actual outcome in each account.
3. Rehome and consolidate the other accounts, then deepen each specialist path from its own sources. Preserve all existing substance and archive entries; captions are absorbed into media rather than discarded.
4. Wire single ownership, path-scoped local arrows and legacy link resolution. No layout redesign is required.
5. Run source/translation/chronology checks, ownership uniqueness, archive/citation integrity and existing project checks. Use representative EN/ID browser flows for default path, switching, local arrows, references, language switching and Back.
6. Re-run the existing throttled mobile scroll sample and map/mosaic checks only once the reader changes are implemented. Preserve on-demand WebGL, no closed-map pin updates, existing DOM mosaic reuse, lazy previews and debounced URL updates. The user reports the current physical-phone experience is now smooth; treat that as a baseline to retain.

## Remaining targeted checks before final publication

- Obtain and reconcile the original Pepera assembly totals; verify any exact threat quote in its original text/recording.
- Recover the original Mapenduma/ICRC inquiry if possible; meanwhile keep secondary reporting clearly attributed.
- Check Biak unit numbering and casualty categories against original reports.
- Check the Paniai inquiry victim list and later appeal status; do not rely on an older article for today's legal outcome.
- Verify later accountability developments for Wasior/Wamena before writing a present-tense conclusion.
- Deep-read MIFEE's locality chapters and company response before publishing detailed transaction amounts or village-level mortality claims.
- Keep the user's family involvement and the unidentified green-flag organisation out until independently corroborated, as agreed in the preceding pass.

These are claim-level checks. They do not prevent drafting the substantial, already-supported history of coercion, military attacks, civilian organising and land loss.
