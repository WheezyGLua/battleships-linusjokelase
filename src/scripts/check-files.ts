
import fs from 'fs';
import path from 'path';

const components = [
  'src/components/segment/create-team-dialog.tsx',
  'src/app/actions/segment-teams.ts',
  'src/app/actions/game.ts'
];

components.forEach(c => {
  const p = path.resolve('b:/Projects/battleships', c);
  if (fs.existsSync(p)) {
    console.log(`[OK] ${c}`);
  } else {
    console.log(`[MISSING] ${c}`);
  }
});
