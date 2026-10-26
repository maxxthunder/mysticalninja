"""Decompressor for the game's graphics/tilemap packing ($00:9F0E-$00:A095), through a 1 KB ring buffer.
Usage: python tools/lz.py <rom> <bank><addr hex, e.g. 0C8000> <out.bin>   (no args: self-check)

Stream: u16 length (including these 2 bytes), then commands:
  00-7F x  copy (b>>2)+2 bytes from ring position ((b<<8|x) - $3DF) & $3FF
  80-9F    b&1F literal bytes follow (0 = 256)
  A0-BF    (b&1F)+2 pairs of (00, literal)
  C0-DF v  (b&1F)+2 copies of v
  E0-FE    (b&1F)+2 zero bytes
  FF n     n+2 zero bytes
Pointer records in the load lists are u16 address + bank; bank bit 7 = write output to every other byte."""
import os
import sys
import zlib


def off(bank, addr):
    return (bank & 0x7F) * 0x8000 + (addr & 0x7FFF)


def decompress(rom, o, maxout=0x20000):
    """(data, bytes consumed, stored length) for the block at file offset o."""
    n = rom[o] | rom[o + 1] << 8
    end, i = o + n, o + 2
    ring, rp, out = bytearray(0x400), 0, bytearray()

    def put(b):
        nonlocal rp
        ring[rp] = b
        rp = (rp + 1) & 0x3FF
        out.append(b)

    while i < end and len(out) < maxout:
        b = rom[i]
        i += 1
        if b < 0x80:
            ln, pos = (b >> 2) + 2, (((b << 8) | rom[i]) - 0x3DF) & 0x3FF
            i += 1
            for _ in range(ln):
                put(ring[pos])
                pos = (pos + 1) & 0x3FF
        elif b < 0xA0:
            for _ in range((b & 0x1F) or 256):
                put(rom[i])
                i += 1
        elif b < 0xC0:
            for _ in range((b & 0x1F) + 2):
                put(0)
                put(rom[i])
                i += 1
        elif b < 0xE0:
            v = rom[i]
            i += 1
            for _ in range((b & 0x1F) + 2):
                put(v)
        elif b < 0xFF:
            for _ in range((b & 0x1F) + 2):
                put(0)
        else:
            c = rom[i]
            i += 1
            for _ in range(c + 2):
                put(0)
    return bytes(out), i - o, n


def demo():
    # four blocks from $0C:8000 on, checked byte for byte against WRAM captured in Mesen (they load to $7F:0000+)
    rom = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "roms", "Legend of the Mystical Ninja, The (USA).sfc"), "rb").read()
    for addr, size, crc in ((0x8000, 896, 0x48534EA5), (0x81A0, 992, 0x81FE1A2D), (0x83CE, 896, 0x9DFE3744), (0x8D99, 128, 0xB9CA6C04)):
        d = decompress(rom, off(0x0C, addr))[0]
        assert (len(d), zlib.crc32(d)) == (size, crc), hex(addr)
    print("ok")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        demo()
    else:
        rom = open(sys.argv[1], "rb").read()
        data, used, n = decompress(rom, off(int(sys.argv[2][:2], 16), int(sys.argv[2][2:], 16)))
        open(sys.argv[3], "wb").write(data)
        print(len(data), "bytes from", n, "compressed")
