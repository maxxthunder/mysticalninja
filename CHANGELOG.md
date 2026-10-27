# Changelog

Changes to the [password generator](https://maxxthunder.github.io/mysticalninja/). The version is shown at the bottom of the page.

## 1.0.4 (2026-10-26)
- Armor and food items have big − and + buttons around their box, plus max; the 0 button and the box's tiny spinner arrows are gone.

## 1.0.3 (2026-10-26)
- On iOS Safari, using a slider after loading a code no longer scrolls the page: the control you're touching stays put when the summary above it rewraps.

## 1.0.2 (2026-10-26)
- Sliders follow your finger anywhere along them on a phone, and dragging one no longer scrolls the page (iOS Safari only moved them by the thumb).

## 1.0.1 (2026-10-26)
- Logbook codes are compact rows: the zone codes take one line each, and a code's start point and notes share one small line.
- On phones, dragging the lives, health or story sliders no longer makes the page jump.
- A number box can be cleared to type a new value; it no longer snaps back to 0.
- The big text view scrolls to its top on a phone held sideways.
- Story steps 6 and 7 in zone 9 are marked ⚠ on Story flags, even while it's closed.
- Armor and food icons line up with their number boxes; autocorrect is off in the decode box.

## 1.0.0 (2026-10-26)
- First release: make or decode logbook passwords for The Legend of the Mystical Ninja on Super Nintendo, full (31 / 55 symbols) or short (6 / 7), for one or two players or Dr. Yang alone.
- Every field the logbook holds: zone, ryo, lives, health, POW and POW pieces, bombs, weapon level, the four jutsu, helmets, armor, sandals, pizza, slices, hamburgers and the key items, with icons ripped from the game.
- Glitch mode for values past the game's own limits, including the coin-throw weapon (level 4) and the missing zone 8.
- Passwords drawn in the game's own logbook font, ripped from the entry screen; short codes stay in one piece.
- Big text view with a typing guide: the entry screen's grid with the next symbol lit and the moves to reach it.
- Point at a symbol to see which fields it holds, or at a control to see its symbols.
- Zone picker with a thumbnail of each starting point; 0 and max buttons on every armor and food item.
- Undo after Max everything, New game or loading a logbook; after editing a loaded logbook, the symbols that changed are underlined so only those need retyping.
- A live copy of the in-game HUD on each player card: health bar, spare-life heads, POW and ryo.
- Copy button; a pasted or typed logbook decodes as soon as it's complete, with one-symbol fixes for mistyped ones and the suspect symbol marked on the code.
- 18 logbook codes: the GameFAQs list checked, six of its typos fixed, and seven new codes. Every one was loaded in Mesen 2.
- Works with the US, US Virtual Console, European and German releases, which all use the same logbook code, and with the Japanese release: a Game version switch shows and reads logbooks in kana (Japan 1.1–1.2, or 1.0 with its own keys), in the game's own kana font, with a kana typing guide. Japanese browsers open on the kana view.
- The decoder matches the game's own on 1,557 fuzzed logbooks.
- Field notes from Mesen and a whole-ROM scan: the elephant checkpoints and their continue screen, a debug room-select menu (it only runs in an unused zone 1 test room) and the unused side show it reaches, an uncalled stage select (still nearly working in the 1991 beta, along with a mode-7 test; the beta has no logbook), the two castle starts, story steps 6 and 7 crashing the castle, and the area event value being zeroed on load.
