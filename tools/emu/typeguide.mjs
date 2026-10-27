// node tools/emu/typeguide.mjs "<logbook>" -> Lua button presses that type it the way the page's typing guide says
// (moves() in mninja.js), ending with B on END. Kana logbooks use the Japanese grid.
import { clean, moves } from '../../mninja.js';

const pw = clean(process.argv[2]);
const out = [];
for (let k = 0; k <= pw.length; k++) {
  for (const [dir, n] of moves(pw, k)) for (let i = 0; i < n; i++) out.push(`press({${dir}=true},2) wait(6)`);
  out.push('press({b=true},2) wait(8)');
}
console.log(out.join('\n'));
