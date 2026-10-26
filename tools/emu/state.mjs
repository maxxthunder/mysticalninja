// node tools/emu/state.mjs '{"stage":4,"story":3,"p0.lives":0}' -> the "Last level" logbook with those fields changed
import { decode, encode } from '../../mninja.js';

const s = decode('8#4V7LprBy4v52Bj@7-TYM?0P7/4By;').state;
delete s.pad; delete s.p[0].pad;
for (const [k, v] of Object.entries(JSON.parse(process.argv[2] ?? '{}'))) {
  if (/^p[01]\./.test(k)) s.p[+k[1]][k.slice(3)] = v; else s[k] = v;
}
console.log(encode(s));
