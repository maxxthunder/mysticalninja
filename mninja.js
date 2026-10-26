// The Legend of the Mystical Ninja (SNES) logbook password codec, ported from the ROM:
// $1C:AFC7 decode, $1C:ACE5 encode, $1C:AD67 pack, $1C:ADB4 unpack, $1C:AE4E checksum; tables at $02:FD3E-$02:FDFF.

// The 64 glyphs in value order (table $02:FDC2). The game draws ^ as a triangle and * as a heart.
export const ALPHABET = 'BDGHJQRTVWbdghjqrtvw01234!"^*+=>?@KLMNPXYZ#$klmnpxyz%&56789-/:;<';
export const SHOW = { '^': '△', '*': '♡' };  // how the logbook screen draws them
const SUBST = { '△': '^', '▲': '^', '¥': '^', '♡': '*', '♥': '*', '¢': '*', '“': '"', '”': '"' };

// $02:FD3E: the XOR key for every data char, and also the common block's field list
const XOR = [0x04, 0x82, 0x00, 0x02, 0xAA, 0x00, 0x04, 0x8E, 0x00, 0x02, 0xA8, 0x00, 0x04, 0xF6, 0x19, 0x00, 0xFF, 0xFF,
  0x10, 0x1C, 0x00, 0x04, 0x1E, 0x00, 0x04, 0x20, 0x00, 0x05, 0x22, 0x00, 0x04, 0x24, 0x00, 0x06, 0x2A, 0x00, 0x05, 0x18,
  0x00, 0x05, 0x1A, 0x00, 0x01, 0x46, 0x00, 0x01, 0x48, 0x00, 0x01, 0x4A, 0x00, 0x01, 0x4C, 0x00, 0x08, 0x50, 0x00, 0x08,
  0x52, 0x00, 0x08, 0x54, 0x00, 0x08, 0x60, 0x00, 0x08, 0x62, 0x00, 0x08, 0x64, 0x00];
// Japan 1.0 ($02:EF2F): the same field list naming other RAM (P1 at $1A80), so other keys at data chars 13, 37, 40, 43, 46, 49 and 52
const XOR_JP10 = [0x04, 0x82, 0x00, 0x02, 0xAA, 0x00, 0x04, 0x8E, 0x00, 0x02, 0xA8, 0x00, 0x04, 0xC6, 0x19, 0x00, 0xFF,
  0xFF, 0x10, 0x1C, 0x00, 0x04, 0x1E, 0x00, 0x04, 0x20, 0x00, 0x05, 0x22, 0x00, 0x04, 0x24, 0x00, 0x06, 0x2A, 0x00, 0x05,
  0x38, 0x00, 0x05, 0x3A, 0x00, 0x01, 0x56, 0x00, 0x01, 0x58, 0x00, 0x01, 0x5A, 0x00, 0x01, 0x5C, 0x00, 0x08, 0x60, 0x00,
  0x08, 0x62, 0x00, 0x08, 0x64, 0x00, 0x08, 0x70, 0x00, 0x08, 0x72, 0x00, 0x08, 0x74, 0x00];

// The Japanese release uses kana in this value order (table $02:EFBA; one table in all revisions, checked in Mesen)
export const KANA = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよわらりるれろがぎぐげござじずぜぞだぢづでどぱぴぷぺぽ';
// us also covers the US Virtual Console, Europe and Germany; jp is Japan 1.1, 1.2 and the 1.2 Virtual Console
export const VERSIONS = { us: [ALPHABET, XOR], jp: [KANA, XOR], jp10: [KANA, XOR_JP10] };

// [name, bits] in pack order. RAM: common fields are $82 $AA $8E $A8 $19F6; player fields are offsets from
// $1A90 (P1) / $1B40 (P2). BCD fields hold decimal digits: ryo, pow, pieces, bombs.
export const LONG_COMMON = [['stage', 4], ['out', 2], ['story', 4], ['players', 2], ['event', 4]];
export const LONG_PLAYER = [['ryo', 16], ['ryo5', 4], ['lives', 4], ['health', 5], ['pieces', 4], ['bombs', 6],
  ['maxHealth', 5], ['pow', 5], ['jutsu1', 1], ['jutsu2', 1], ['jutsu3', 1], ['jutsu4', 1],
  ['goldHelmet', 8], ['ironHelmet', 8], ['strawHat', 8], ['goldArmor', 8], ['chainArmor', 8], ['strawCoat', 8],
  ['sandals', 8], ['pizza', 8], ['slice', 8], ['hamburger', 8],
  ['pass', 1], ['text', 1], ['elephant1', 1], ['elephant2', 1], ['elephant3', 1], ['elephant4', 1], ['weapon', 2]];
export const SHORT_COMMON = [['stage', 4], ['players', 2]];
export const SHORT_PLAYER = [['jutsu1', 1], ['jutsu2', 1], ['jutsu3', 1], ['jutsu4', 1]];

const blocks = s => {
  const [common, player] = s.long ? [LONG_COMMON, LONG_PLAYER] : [SHORT_COMMON, SHORT_PLAYER];
  const out = [[s, common]];
  for (const p of [0, 1]) if (s.players & (1 << p)) out.push([s.p[p], player]);
  return out;
};

// one block: values LSB first, 6 bits per char, the first bit becomes the char's top bit. The last char's spare
// bits are ignored by the decoder; the game sometimes leaves bits there, so decode keeps them in obj.pad
function pack(obj, fields) {
  const chars = [];
  let acc = 0, n = 0;
  for (const [name, bits] of fields) {
    const v = obj[name] ?? 0;
    if (!Number.isInteger(v) || v < 0 || v >= 2 ** bits) throw new RangeError(`${name}=${v}`);
    for (let i = 0; i < bits; i++) {
      acc = acc << 1 | (v >> i & 1);
      if (++n === 6) { chars.push(acc); acc = n = 0; }
    }
  }
  if (n) chars.push(acc << (6 - n) | (obj.pad ?? 0) & ((1 << (6 - n)) - 1));
  return chars;
}

function unpack(chars, pos, fields) {
  const obj = {};
  let i = 0;
  for (const [name, bits] of fields) {
    let v = 0;
    for (let k = 0; k < bits; k++, i++) v |= ((chars[pos + (i / 6 | 0)] ?? 0) >> (5 - i % 6) & 1) << k;
    obj[name] = v;
  }
  if (i % 6) obj.pad = (chars[pos + (i / 6 | 0)] ?? 0) & ((1 << (6 - i % 6)) - 1);
  return [obj, pos + Math.ceil(i / 6)];
}

// $1C:AE4E: 16-bit sum of every field, masked to two 6-bit chars
const checksum = list => {
  let s = 0;
  for (const [obj, fields] of list) for (const [name, bits] of fields) s += obj[name] & (2 ** bits - 1);
  s &= 0x3F3F;
  return [s & 0xFF, s >> 8];
};

// data symbols past the checksum that nothing reads (a decoded code whose length doesn't match its players);
// zero players needs them to reach a length the game takes (6 or 31)
const tailOf = s => s.tail ?? (s.players ? [] : Array(s.long ? 24 : 1).fill(0));

// s = { long, key (1-63), stage, players (1 = P1, 2 = P2, 3 = both), out, story, event, p: [p1, p2] }
export function encode(s, ver = 'us') {
  const [abc, xor] = VERSIONS[ver];
  const list = blocks(s), data = list.flatMap(([o, f]) => pack(o, f)), tail = tailOf(s);
  const body = [...data, ...checksum(list), ...tail], key = s.key ?? 1, n = data.length + tail.length;
  const v = [((n + key) & 63) ^ 0x2A, ((key + 7) & 63) ^ 0x15, ...body.map((c, i) => ((c + key) ^ xor[i]) & 63)];
  return v.map(c => abc[c]).join('');
}

// What each symbol of encode(s) holds: a list of field names per symbol ('p0.ryo' for a player field)
export function layout(s) {
  const out = [['length'], ['key']];
  const [common, player] = s.long ? [LONG_COMMON, LONG_PLAYER] : [SHORT_COMMON, SHORT_PLAYER];
  const add = (fields, pre) => {
    const at = out.length;
    let n = 0;
    for (const [name, bits] of fields) for (let i = 0; i < bits; i++, n++) {
      const names = out[at + (n / 6 | 0)] ??= [];
      if (names.at(-1) !== pre + name) names.push(pre + name);
    }
  };
  add(common, '');
  for (const p of [0, 1]) if (s.players & (1 << p)) add(player, `p${p}.`);
  return [...out, ['checksum'], ['checksum'], ...tailOf(s).map(() => ['unused'])];
}

// Glyphs as typed (accepts the game's △ ♡ and GameFAQs' ¥ ¢ and '' for "; katakana read as hiragana), spaces dropped
export const clean = text => [...text.replace(/''/g, '"').replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60))]
  .filter(c => !/\s/.test(c)).map(c => SUBST[c] ?? c).join('');

// Returns { state } or { error, state? }; state is filled in as far as the game itself reads it.
export function decode(text, ver = 'us') {
  const [abc, xor] = VERSIONS[ver];
  const t = clean(text);
  const bad = [...t].filter(c => !abc.includes(c));
  if (bad.length) return { error: 'glyph', bad: [...new Set(bad)] };
  if (![6, 7, 31, 55].includes(t.length)) return { error: 'length', length: t.length };
  const v = [...t].map(c => abc.indexOf(c));
  const long = t.length > 7, key = ((v[1] ^ 0x15) - 7) & 63, n = ((v[0] ^ 0x2A) - key) & 63;
  // the entry screen zeroes the byte after the last glyph; past that the decoder reads leftovers, taken as 0 here
  const d = [...v.slice(2, 2 + n + 2).map((c, i) => ((c ^ xor[i]) - key) & 63), ...v.slice(2 + n + 2), ...Array(64).fill(0)];
  let [s, pos] = unpack(d, 0, long ? LONG_COMMON : SHORT_COMMON);
  Object.assign(s, { long, key, p: [{}, {}] });
  if (!long) Object.assign(s, { out: 0, story: 0, event: 0 });
  const list = [[s, long ? LONG_COMMON : SHORT_COMMON]];
  for (const p of [0, 1]) if (s.players & (1 << p)) {
    [s.p[p], pos] = unpack(d, pos, long ? LONG_PLAYER : SHORT_PLAYER);
    list.push([s.p[p], long ? LONG_PLAYER : SHORT_PLAYER]);
  }
  const [c0, c1] = checksum(list);
  if (n !== t.length - 4) return { error: 'length-char', state: s };
  if (d[pos] !== c0 || d[pos + 1] !== c1) return { error: 'checksum', state: s };
  if (pos < n) s.tail = d.slice(pos + 2, n + 2);
  if (s.stage >= 10) return { error: 'stage', state: s };
  if (long && s.story >= 8) return { error: 'story', state: s };
  return { state: s };
}

// BCD helpers: the game stores ryo, POW, POW pieces and bombs as decimal digits
export const fromBCD = v => /^\d+$/.test(v = v.toString(16)) ? +v : null;
export const toBCD = n => parseInt(n, 16);
export const ryo = p => { const lo = fromBCD(p.ryo), hi = p.ryo5 > 9 ? null : p.ryo5; return lo === null || hi === null ? null : hi * 10000 + lo; };
