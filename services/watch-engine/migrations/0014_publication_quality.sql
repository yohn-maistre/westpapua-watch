-- Preserve source articles and editorial history; withdraw diagnostic copy for review.
UPDATE developments SET status='held',editorial_pending=1,editorial_dispatch_id=NULL
WHERE status='published' AND (
 lower(title_en) LIKE '%insufficient evidence%' OR
 lower(title_en) LIKE '%unable to synthesize%' OR
 lower(title_en) LIKE '%cannot synthesize%'
);

CREATE TABLE IF NOT EXISTS cluster_pair_reviews (
 left_id INTEGER NOT NULL, right_id INTEGER NOT NULL,
 signature TEXT NOT NULL, relation TEXT NOT NULL, reviewed_at TEXT NOT NULL,
 PRIMARY KEY(left_id,right_id)
);
