#!/bin/sh
# Load a logbook in Mesen and dump the result.
# Usage: tools/emu/loadcode.sh <outdir> "<logbook>" [frames=500] [extra lua run after loading]
#   TYPE=1 types it with real button presses (typeguide.mjs) instead of injecting it
# Writes <outdir>/g1.png and g1.ram (128 KB WRAM) and prints "R <stage> <story> <$19F6 table>".
# Env: MESEN (default K:\Emulators\Mesen\Mesen.exe), ROM (default roms/ USA ROM).
here=$(cd "$(dirname "$0")" && pwd)
d=$1; mkdir -p "$d"
{
  cat "$here/logbook.lua"
  if [ "$TYPE" = 1 ]; then node "$here/typeguide.mjs" "$2"
  else
    node "$here/mkpw.mjs" "$2" ${ROM:+"$ROM"}
    echo 'wait(10) for i=1,6 do press({down=true},2) wait(10) end for i=1,8 do press({right=true},2) wait(10) end press({b=true},2)'
  fi
  echo "wait(${3:-500})"
  echo "$4"
  echo "at(function() shot('g1') dump('g1') local t={} for a=0x19F6,0x1A05,2 do t[#t+1]=string.format('%04x',emu.read16(a,emu.memType.snesWorkRam)) end print('R', emu.read(0x82,emu.memType.snesWorkRam), emu.read(0x8E,emu.memType.snesWorkRam), table.concat(t,' ')) end)"
} > "$d/t.lua"
MESEN="${MESEN:-K:\\Emulators\\Mesen\\Mesen.exe}" python "$here/mesen.py" "$d/t.lua" "${ROM:-$here/../../roms/Legend of the Mystical Ninja, The (USA).sfc}" | grep -v "^wrote\|^dumped\|^rc 0"
