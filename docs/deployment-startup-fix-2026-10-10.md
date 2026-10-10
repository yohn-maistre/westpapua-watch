# Pages startup correction

The deployment of `2ae1651` passed content checks, the production build and regression checks, but Cloudflare rejected the Pages Functions bundle with `Script startup exceeded CPU time limit`. The previous production site therefore remained active.

Ask's import of the revised History records brought the reader and catalogue construction into the Pages startup graph. Catalogue normalization, merging and source-to-account construction ran when the isolate started, even for requests unrelated to Ask. The static corpus now builds during `npm run build` and is saved in `content/generated/site-search.json`. Both Pages and the Watch Engine retrieve the same source-bearing records from that snapshot. The ranking algorithm, answers, providers and citations are unchanged.

The snapshot is committed so direct Worker builds remain supported, and the Pages build regenerates it from current content. Regression checks compare the snapshot with the canonical corpus and inspect the Pages Ask bundle's dependency graph to prevent catalogue/reader construction from returning to startup.

On this workspace's Node runtime, evaluating the actual compiled Pages bundle took approximately 388 ms wall / 444 ms CPU before the change and 12 ms wall / 12 ms CPU afterwards. This is a local diagnostic, not a Cloudflare startup measurement. Production deployment acceptance and live-page verification are the final checks.
