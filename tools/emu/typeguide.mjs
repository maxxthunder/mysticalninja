// node tools/emu/typeguide.mjs "<logbook>" -> Lua button presses that type it the way the page's typing guide says
// (same move plan as guide() in index.html), ending with B on END. Kana logbooks use the Japanese grid.
const pw = [...process.argv[2].replace(/\s/g, '').replace(/△/g, '^').replace(/♡/g, '*')];
const KB = /[ぁ-ゖ]/.test(pw[0])
  ? ['あいうえおやゆよわ', 'かきくけこらりるれろ', 'さしすせそがぎぐげご', 'たちつてとざじずぜぞ', 'なにぬねのだぢづでど', 'はひふへほぱぴぷぺぽ', 'まみむめも']
  : ['BDGHJKLMNP', 'QRTVWXYZ#$', 'bdghjklmnp', 'qrtvwxyz%&', '0123456789', '!"^*+-/:;<', '=>?@'];
const where = c => { const r = KB.findIndex(row => row.includes(c)); return [r, [...KB[r]].indexOf(c)]; };
const n = pw.length, at = k => k < 0 ? [0, 0] : k < n ? where(pw[k]) : [6, 8];
const out = [];
const go = (b, k) => { for (let i = 0; i < Math.abs(k); i++) out.push(`press({${b}=true},2) wait(6)`); };
const H = d => go(d > 0 ? 'right' : 'left', d), V = d => go(d > 0 ? 'down' : 'up', d);
for (let step = 0; step <= n; step++) {
  const [r0, c0] = at(step - 1), [r, c] = at(step);
  if (step === n && r0 === 6) H(6 - c0);
  else if (r0 === 6 || (r0 === 0 && c === 9)) { V(r - r0); H(c - c0); }  // the kana grid's top row has no column 9
  else { H(c - c0); V(r - r0); }
  out.push('press({b=true},2) wait(8)');
}
console.log(out.join('\n'));
