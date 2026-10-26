// Random in-range logbooks from mninja.js, checked against Mesen's RAM after loading.
//   node tools/emu/randcodes.mjs gen <dir> [count=16]  -> <dir>/cases.json, one logbook per line on stdout
//   (load each with: tools/emu/loadcode.sh <dir>/c<i> "<logbook>" 150; read soon after loading,
//    before an enemy can hit you: a hit drops the weapon and armor)
//   node tools/emu/randcodes.mjs cmp <dir>             -> every player field compared with <dir>/c<i>/g1.ram
import { encode, toBCD } from '../../mninja.js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const [mode, dir, count = 16] = process.argv.slice(2);
// WRAM offset in the player block ($1A90 P1, $1B40 P2) and width
const OFF = { ryo: [0x1C, 2], ryo5: [0x1E], lives: [0x20], health: [0x22], pieces: [0x24], bombs: [0x2A], maxHealth: [0x18], pow: [0x1A],
  weapon: [0x28], jutsu1: [0x46], jutsu2: [0x48], jutsu3: [0x4A], jutsu4: [0x4C], goldHelmet: [0x50], ironHelmet: [0x52], strawHat: [0x54],
  goldArmor: [0x60], chainArmor: [0x62], strawCoat: [0x64], sandals: [0x70], pizza: [0x80], slice: [0x82], hamburger: [0x84],
  pass: [0x90], text: [0x92], elephant1: [0x94], elephant2: [0x96], elephant3: [0x98], elephant4: [0x9A] };

if (mode === 'gen') {
  let seed = 12345;
  const R = n => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n;
  const player = () => {
    const max = 8 + 2 * R(5), r = R(100000), p = { ryo: toBCD(r % 10000), ryo5: Math.trunc(r / 10000), lives: R(10), maxHealth: max,
      health: 1 + R(max), pow: toBCD(R(11)), pieces: toBCD(R(10)), bombs: toBCD(R(31)), weapon: R(3), sandals: R(4) };
    for (const k of Object.keys(OFF)) if (!(k in p)) p[k] = /^(jutsu|pass|text|elephant)/.test(k) ? R(2) : R(100);
    return p;
  };
  const stages = [1, 2, 3, 4, 5, 6, 7, 9], cases = [];
  for (let i = 0; i < count; i++) {
    const s = { long: 1, key: 1 + R(63), stage: stages[i % 8], players: [1, 2, 3][R(3)], out: 0, story: 0, event: R(16), p: [player(), player()] };
    cases.push({ pw: encode(s), s });
  }
  writeFileSync(`${dir}/cases.json`, JSON.stringify(cases));
  console.log(cases.map(c => c.pw).join('\n'));
} else if (mode === 'cmp') {
  const cases = JSON.parse(readFileSync(`${dir}/cases.json`)), bad = [];
  cases.forEach(({ pw, s }, i) => {
    const f = `${dir}/c${i}/g1.ram`;
    if (!existsSync(f)) return bad.push(`${i}: no dump`);
    const ram = readFileSync(f), diffs = [];
    if (ram[0x82] !== s.stage) diffs.push(`stage ${ram[0x82]} != ${s.stage}`);
    for (const p of [0, 1]) if (s.players & (1 << p)) for (const [k, [o, n]] of Object.entries(OFF)) {
      const a = (p ? 0x1B40 : 0x1A90) + o, v = n === 2 ? ram.readUInt16LE(a) : ram[a];
      if (v !== s.p[p][k]) diffs.push(`P${p + 1} ${k} ${v} != ${s.p[p][k]}`);
    }
    if (diffs.length) bad.push(`${i} ${pw}: ${diffs.join(', ')}`);
  });
  console.log(`${cases.length - bad.length}/${cases.length} match${bad.length ? '\n' + bad.join('\n') : ''}`);
  process.exitCode = bad.length ? 1 : 0;
} else console.log('usage: randcodes.mjs gen|cmp <dir> [count]');
