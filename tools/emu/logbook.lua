-- Prepended to Mesen scripts by loadcode.sh: helpers, then boot from power-on to the logbook entry screen.
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
