import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = [
  'src/data/developments.ts',
  'src/data/issues.ts',
  'src/data/resources.ts',
  'src/data/history.ts',
  'src/data/events.ts'
];
let failed = false;
for (const rel of files) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    console.error(`missing ${rel}`);
    failed = true;
    continue;
  }
  const text = fs.readFileSync(full, 'utf8');
  if (/TODO_CONTENT|example\.com/.test(text)) {
    console.error(`placeholder marker found in ${rel}`);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log('content checks passed');
