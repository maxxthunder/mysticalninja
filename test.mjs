// node test.mjs — round-trips published and new passwords through the ROM-derived codec.
import assert from 'node:assert';
import { decode, encode, layout, ryo } from './mninja.js';

// Codes the game itself made (GameFAQs, with the typos fixed) plus the new ones from docs/secrets.md
const valid = ['MRbjhj', '#rM/B/', '8hXw0w', 'W:3LNL', 'k=bPbR', '1tL<H<', '"?kk5k', '&xT>X>', 'H-WNxN', '/j#2^2',
  ':jH204;', '8#4V7LprBy4v52Bj@7-TYM?0P7/4By;', '*63>^:tH!8d%W!L1G^4MdTH6Q^>HLwW', 'vxZ++lh:@Ynn3+!$T+KKhG:!<+!+X@r',
  'b!DQQZ%$"Rt<5JBy+J--04N?+vkJl<J', 'b!DQQTnQhTQThQDz*Q991!QD^RBQQvM', '%>H3Hmq^dWL!D@d&"Hp/w>$>+HTLdJQ',
  'lj/N0<*kM2%mvyMKh0>$JV/Yb0r%*70kM/%#ryNg0t901v/l*01=*Wt'];
for (const pw of valid) {
  const r = decode(pw);
  assert.ok(r.state && !r.error, `${pw}: ${r.error}`);
  assert.strictEqual(encode(r.state), pw, pw);
}

// accepted by the game in a Mesen fuzz run (zero players, key 0, maxed shared fields, one-symbol mutations)
const fuzzed = ["Yv2GHG", "xv0BBG#BBbBGVBJ5!B<<r*BJ=BJ?BrK", "%>v<<DZHHWHDdHT&\"H//w>HT+HTLH%@", "MRbghj", "MRbhhj", "MRbqhj", ":jr204;", ":jH004;", ":jH104;", ":jH304;", ":jH214;", ":jH224;", ":jH234;"];
for (const pw of fuzzed) { const r = decode(pw); assert.ok(!r.error, pw); assert.strictEqual(encode(r.state), pw, pw); }
for (const pw of fuzzed.slice(0, 2)) { const { state } = decode(pw); delete state.tail; assert.strictEqual(encode(state), pw, pw); }  // zero players from scratch

// Japanese: same values in kana (1.1/1.2); 1.0 re-keys some data chars. These two loaded in Mesen in those versions.
assert.strictEqual(encode(decode('8#4V7LprBy4v52Bj@7-TYM?0P7/4By;').state, 'jp'), 'でれのけづやごちあじのてだぬあそめづぱくりゆむなわづぴのあじぺ');
assert.strictEqual(encode(decode('8#4V7LprBy4v52Bj@7-TYM?0P7/4By;').state, 'jp10'), 'でれのけづやごちあじのてだぬあぺめづぱくりゆむなわづぴのあじぺ');
for (const pw of [...valid, ...fuzzed]) for (const ver of ['jp', 'jp10']) {
  const kana = encode(decode(pw).state, ver), r = decode(kana, ver);
  assert.ok(!r.error, `${pw} ${ver}`);
  assert.strictEqual(encode(r.state), pw, `${pw} ${ver}`);
  if (pw.length <= 7) assert.strictEqual(kana, encode(decode(pw).state, 'jp'), pw);  // short codes are the same in every version
}
assert.strictEqual(decode('デレノケヅヤゴチアジノテダヌアソメヅパクリユムナワヅピノアジペ', 'jp').state.stage, 9);  // katakana accepted
assert.ok(decode('でれのけづやごちあじのてだぬあぺめづぱくりゆむなわづぴのあじぺ', 'jp').error);  // a 1.0 logbook fails in 1.1/1.2

// layout() names one entry per symbol, and the ryo symbols for the field map
for (const pw of [...valid, ...fuzzed]) assert.strictEqual(layout(decode(pw).state).length, pw.length, pw);
assert.deepStrictEqual(layout(decode('MRbjhj').state).map(x => x.join()), ['length', 'key', 'stage,players', 'p0.jutsu1,p0.jutsu2,p0.jutsu3,p0.jutsu4', 'checksum', 'checksum']);

// GameFAQs as posted: each fails the way docs/secrets.md says
assert.strictEqual(decode('8hXwow').error, 'glyph');
assert.strictEqual(decode('K=bPbR').error, 'length-char');
assert.strictEqual(decode('1tl<H<').error, 'checksum');
assert.strictEqual(decode('¢63>¥ :tH!8 d%w!L 1G¥4M dTH6Q ¥>HLw W').error, 'checksum');
assert.strictEqual(decode('MRbjh').error, 'length');
assert.strictEqual(encode(decode("''?kk5k").state), '"?kk5k');  // GameFAQs writes the " symbol as two quote marks

// a few fields, checked against what Mesen showed
const last = decode('8#4V7 LprBy 4v52B j@7-T YM?0P 7/4By ;').state;
assert.deepStrictEqual([last.stage, last.players, ryo(last.p[0]), last.p[0].weapon], [9, 1, 6465, 2]);
assert.strictEqual(decode('vxZ++lh:@Ynn3+!$T+KKhG:!<+!+X@r').state.p[0].hamburger, 128);
assert.strictEqual(decode('△63>♡ :tH!8 d%W!L 1G♡4M dTH6Q ♡>HLw W').error, 'length-char');  // △/♡ swapped is wrong

console.log(`${valid.length + fuzzed.length} passwords round-trip; posted typos rejected as expected`);
