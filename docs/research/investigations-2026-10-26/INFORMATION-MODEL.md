# Information structure for the investigative record

Planning, not an implemented schema. This note defines editorial objects and research operations before UI decisions. It complements [the research brief](RESEARCH-BRIEF.md).

## 1. Three layers

**Editorial files** ask and answer intelligible questions: a Merauke project, a weapons incident, an autonomy-funding dispute, an actor's business history. They contain an authored account and documented open questions.

**Shared records** describe participants, places, events, transactions, permits, proceedings, observations, quotations and positions. The same record can be used in several files without being rewritten or silently reclassified.

**Evidence** connects each substantive statement to a specific work/version/passage, with source role, original language, date and limitations. Source inspection should reveal the actual support, rather than merely send readers to a long bibliography.

The central object is a **claim with provenance**. A line in a graph is one possible rendering of that claim, not a substitute for its meaning or evidence.

## 2. Record families

| Family | What it contains | Important distinction |
|---|---|---|
| Entity | Person, office, government body, company, business group, organisation, community, project, asset or place | A business group is not automatically an incorporated company; an office is not the individual occupying it |
| Role/relationship | Ownership, directorship, appointment, regulation, representation, supplier/customer relation, organisational membership | Valid dates, direction and basis matter; co-appearance is not ownership or control |
| Event/action | A speech, appointment, signing, permit issue, hearing, protest, incident, revocation or response | Event date is distinct from publication, registration and retrieval dates |
| Financial/material record | Loan, disclosed payment, in-kind support, appropriation, contract, order, dividend, royalty, declared donation, alleged transfer | Different accounting bases and procedural states cannot be added indiscriminately |
| Legal/administrative proceeding | Permit process, audit, inquiry, criminal/civil/administrative case, appeal and remedy | Each stage and disposition is a separate event; a legal conclusion is limited to its jurisdiction and issues |
| Observation/effect | Measured or reported land change, water condition, displacement, service interruption, work condition or other documented effect | Record method, geography, period, population and uncertainty; association alone does not establish cause |
| Quote/testimony/position | What a named speaker/writer said, witnessed, argued, supported or opposed | A quote verifies a statement was made, not automatically that its content is true or implemented |
| Idea/argument | An authored account of self-determination, dialogue, adat, economic power, gender, ecology or other political thought | An idea can have multiple authors/adherents and change over time; don't force rigid ideological camps |
| Work/edition | Report, book, article, court text, data release, photograph, film, speech recording or archival collection | Distinguish a work from an edition, translation, syndicated copy or later revision |
| Evidence unit | Exact excerpt, page/paragraph, timestamp, table row, image finding or dataset slice supporting a claim | Keep original and translation separate; describe extraction precision and rights/access |
| Research lead/gap | A proposed connection, document needed, unresolved identity, contradictory figure or request | Not a published fact; no invisible promotion into the accepted graph |
| Dossier/thread | A question, scope, authored narrative, selected records, changes, disputes and next research steps | An editorial selection over the shared record, not a second disconnected database |

## 3. Minimal supported-claim structure

Suggested fields, expressed editorially rather than as a final database migration:

- Stable claim ID, subject, precise predicate and object/participants.
- Valid time or event range, with precision; publication/recording and retrieval dates separately.
- Geographic scope and precision, including historical place/boundary identifiers.
- Evidence-unit IDs and what each supports.
- The statement's origin: document records, named source reports/alleges, witness testifies, analyst infers, court determines, person denies.
- Publication state and review history.
- Related response, contrary evidence, correction or superseding record.
- Whether the relationship expresses chronology, association, authority, a transaction or an explicitly supported mechanism.

Avoid a single undifferentiated `connected_to` link. Useful predicates include `held_office`, `issued`, `signed`, `held_shares_in`, `provided_support_to`, `ordered_from`, `committed_loan_to`, `challenged`, `reported`, `testified`, `called_for`, `denied`, `revoked`, `ruled_on`, `represented` and `advocated`.

The subject of a reported allegation may be different from its asserting source. Preserve both. An agency's own statement is primary evidence of its position; it does not give every claim inside that statement independent factual confirmation.

## 4. A source-backed sequence is not necessarily a causal chain

For example, a company order, a politician's public visit, a land permit and subsequent clearing can all be recorded. A claim that the order financed a political campaign or that an appointment was purchased requires different evidence. Do not create the missing causal edge from an attractive timeline.

For coercion or harm, distinguish the decision-maker, funder, supplier, importer, reported end-user, operational user, affected community and investigator. A connected corporate entity does not automatically inherit responsibility for every downstream incident.

Show gaps as research questions. An honest interrupted sequence can be more useful than a continuous but invented chain.

## 5. Money and material flows

Each record needs:

- Payer/funder, recipient/borrower/seller and any intermediaries.
- Instrument and purpose: grant, loan commitment, drawdown, budget allocation, award, contracted value, actual payment, in-kind support, dividend, tax, royalty, purchase order or alleged bribe.
- Native amount, currency, units and gross/net basis; quantity-only records where no price is established.
- Relevant period, transaction date and source reporting date.
- Procedural state: announced, approved, committed, ordered, invoiced, paid, disputed, cancelled, repaid or unknown.
- Geographic/entity attribution: project-level, subsidiary-level, regional or parent/global.
- Breakdown/aggregation relationship and an explicit rule about whether it can be summed.
- Source and supporting evidence; estimates/ranges/unknowns remain typed, not coerced to zero.

Concrete examples from the read material:

| Record | Correct representation | Incorrect representation |
|---|---|---|
| PTFI 2024 government-security support | US$24m direct costs plus US$2m overhead; distinguish in-kind/monetary components and company attribution | US$26m cash paid to a named unit or for a named attack |
| JBIC Tangguh 2016 loan | Agreement up to US$1.2bn, JBIC portion, named borrower vehicle; disbursement status not established here | US$1.2bn already paid directly to BP, or the whole project's financing |
| SANY/Jhonlin June 2024 order | Order for 2,000 excavators; price/funder/delivery/deployment require additional records | A verified public-budget payment or proof every machine cleared land in Merauke |
| KPU 2024 summary | Disclosed presidential-ticket receipts/spending for the stated reporting process | Every dollar spent in the real campaign, or a donor-level list naming Haji Isam |

Don't double-count a total and its components, a loan and later spending of that loan, or a subsidiary dividend and the parent's later distribution. Shareholding value, managed assets, revenue, profit and cash payments are different measures. An investment manager's disclosed holdings should not be portrayed as its principals' personal ownership without evidence.

Currency conversion needs an explicit date/rate and must retain the native amount. A flow display should not silently mix 2016 commitments, 2024 spending and projected lifetime costs into a single total.

## 6. Quotes, voices and thought

Treat quotes as inspectable records with:

- Speaker/author and the office/role held **at the time**.
- Exact original-language text and an optional separately attributed translation.
- Date, venue/circumstance, intended audience and original publication/recording.
- Stable source locator and enough preceding/following context to preserve meaning.
- Whether it is a direct record, a journalist's quotation, a witness recollection, a later scholarly attribution or an unverified circulating quote.
- Links to the policy, event or debate it addresses.

Only verified wording belongs in quotation marks as an accepted exact quote. A paraphrase needs its own wording/attribution. Keep oral-history accounts identifiable as such; they remain valuable evidence without being disguised as a surviving audio recording.

For the verified April 2021 MPR quotation, model the public statement and its context. Do not turn it into an operational command for a later Kiwirok attack. For widely circulated historical quotations such as those attributed to Ali Murtopo, trace the earliest account/book/page and speaker context before publication.

Thought and strategy should be discoverable through actual works: Tebay's dialogue proposal, Giay's scholarship, Karma's accounts of racism and political imprisonment, women's land/food knowledge, church statements, organising programmes and cultural work. Do not flatten these into a list of inspirational slogans.

## 7. Evidence states and legal status

Use separate fields rather than one confidence score:

- **Retrieval:** obtained, partial, unread lead, unavailable or access-limited.
- **Source role:** official record, regulatory/company disclosure, witness account, journalism, research, advocacy statement, analysis or legal determination.
- **Claim basis:** directly documented action/transaction; attributed finding/allegation; testimony; inference; disputed; unresolved.
- **Publication:** research-only, reviewed for publication, published, corrected or superseded.
- **Proceeding:** inquiry, allegation, charge, first-instance judgment, appeal, final disposition, remedy and implementation.

An investigation may be substantial while a particular ownership link remains unresolved. A court can acquit a researcher without adjudicating every claim in the research. An audit irregularity, unlawful administrative act, conflict of interest and criminal corruption finding are not synonyms.

Person records should organise public roles, interests, decisions and proceedings, with relevant responses. Avoid an unsourced category of 'traitors', a generic corruption score or an ethnic explanation for an individual's conduct.

## 8. Identity, time and geography

- Retain aliases and source spellings, but use evidence to resolve identity. Jhonlin as a group is distinct from each registered legal entity. A surname match does not establish kinship or beneficial ownership.
- Separate active service, retirement, office appointments and business positions by period.
- Store historical jurisdictions. 'Papua' can mean a province at a particular date, western New Guinea, the whole island or Papua New Guinea in an irrelevant search result. Each record needs a clear scope.
- Record approximate/cultural locations as such. A concession, customary territory, settlement, reported incident reference and current displacement location are different geometries with different rights and sensitivity.
- Aggregate casualty/displacement/environmental figures only when definitions, period and coverage align. Keep named/confirmed/reported categories and conflicting estimates visible.

## 9. Source independence, corrections and institutional memory

A single original report can generate a press release, a wire article and several republications. Attach source-family IDs so these do not become multiple independent confirmations. The 2021 nine-organisation coalition report is one collective research output, not nine independent investigations. The Tanah Merah partner publications likewise share an investigation; Jubi's labelled Malind press-release publication is not automatically independent new reporting.

Keep source versions, locators, publication/event times, review notes and superseded claims. A new article does not silently overwrite the historical record. A corrected ownership relationship retains its previous valid period where appropriate.

Store the concrete document needed to resolve a gap. 'Find out more' is less useful than 'obtain the 2024 shareholder deed', 'check the appealed judgment' or 'retrieve the permit amendment following the October announcement'.

## 10. How material becomes a useful investigation

1. Register the lead and its precise question.
2. Obtain and identify the work/version and relevant evidence units.
3. Resolve participants, dates, places and accounting/legal definitions.
4. Record narrow supported claims, responses and gaps.
5. Connect them to the case and the relevant historical or policy records.
6. Write an authored account that explains the supported sequence and effects, including Papuan decisions and responses.
7. Review factual support, attribution, contradictions and reuse rights before publication.
8. Track later documents, outcomes and corrections without erasing earlier states.

AI can propose entities, passages and research questions for this process. It must not promote an inferred allegation into an accepted relationship. The shared record needs to remain useful when inference is unavailable.
