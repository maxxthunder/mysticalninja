-- Prepended to Mesen scripts by loadcode.sh: helpers, then boot from power-on to the logbook entry screen.
function wr(a,v) emu.write(a,v,emu.memType.snesWorkRam) end
-- print every access to lo..hi; memory callbacks match the CPU bus address, so hook every bank mirror
function hook(kind,lo,hi,tag)
  local banks={0x7e} for b=0,0x3f do banks[#banks+1]=b banks[#banks+1]=b+0x80 end
  for _,b in ipairs(banks) do emu.addMemoryCallback(function(a,v) local s=emu.getState() print(string.format("%s %06x=%02x by %02x%04x",tag,a,v,s["cpu.k"],s["cpu.pc"])) end, kind, b*0x10000+lo, b*0x10000+hi, emu.cpuType.snes, emu.memType.snesMemory) end
end
-- code/data log as hex, for cdl2entries.py (wide exec callbacks crash Mesen; this doesn't)
function cdl_dump() at(function()
  local c=emu.getCdlData(emu.memType.snesPrgRom) local t={}
  for i=1,#c do t[#t+1]=string.format('%02x',c[i]) end print('CDLHEX '..table.concat(t)) end) end

-- title screen -> CONTINUE -> FROM LOGBOOK ENTRY; the cursor ends on B
wait(300) press({start=true}) wait(120)
press({down=true}) wait(10) press({down=true}) wait(10)
press({start=true}) wait(90)
press({down=true}) wait(10) press({start=true}) wait(90)
press({down=true}) wait(10) press({start=true}) wait(120)
wait(30)
