"""Print Lua that puts a logbook into the entry screen's buffer, as if typed.
Usage: python tools/emu/mkpw.py "<logbook>" [rom]   (tile words come from the table at $02:FDC2)"""
import os
import sys

ALPHA = 'BDGHJQRTVWbdghjqrtvw01234!"^*+=>?@KLMNPXYZ#$klmnpxyz%&56789-/:;<'
ROM = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "roms", "Legend of the Mystical Ninja, The (USA).sfc")
rom = open(sys.argv[2] if len(sys.argv) > 2 else ROM, "rb").read()
tiles = [rom[0x17DC2 + 2 * i] | rom[0x17DC3 + 2 * i] << 8 for i in range(64)]
pw = "".join({"△": "^", "♡": "*"}.get(c, c) for c in sys.argv[1] if not c.isspace())
w = ",".join(str(tiles[ALPHA.index(c)]) for c in pw)
print("at(function() local w={%s} for i,t in ipairs(w) do emu.write16(0x1680+2*(i-1),t,emu.memType.snesWorkRam) end "
      "emu.write16(0x1626,#w,emu.memType.snesWorkRam) emu.write16(0x1628,#w,emu.memType.snesWorkRam) end)" % w)
