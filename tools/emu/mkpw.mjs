// node tools/emu/mkpw.mjs "<logbook>" [rom] -> Lua that puts a logbook into the entry screen's buffer, as if typed
// (tile words come from the table at $02:FDC2)
import { readFileSync } from 'node:fs';
import { ALPHABET, clean } from '../../mninja.js';

const rom = readFileSync(process.argv[3] ?? new URL('../../roms/Legend of the Mystical Ninja, The (USA).sfc', import.meta.url));
const w = [...clean(process.argv[2])].map(c => rom.readUInt16LE(0x17DC2 + 2 * ALPHABET.indexOf(c))).join(',');
console.log(`at(function() local w={${w}} for i,t in ipairs(w) do emu.write16(0x1680+2*(i-1),t,emu.memType.snesWorkRam) end `
  + 'emu.write16(0x1626,#w,emu.memType.snesWorkRam) emu.write16(0x1628,#w,emu.memType.snesWorkRam) end)');
