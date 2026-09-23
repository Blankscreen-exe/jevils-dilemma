# Image Assets

> Spec for the pixel-art assets the game needs. Art is drawn at its **native size (1×)** and
> scaled up in code by whole numbers, which keeps pixels crisp. On-screen sizes below assume
> the recommended native sizes; the code will be set to exact multiples once the final Jevil
> size is settled.

## Needed

| Asset                      | Native size (1×)                              | Shown at                                                            | Notes                                                                                                                                                                                          |
| -------------------------- | --------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Jevil idle**             | **48 × 54 px**                                | Title 4× (192 × 216)<br>Card 2× (96 × 108)<br>Results 2× (96 × 108) | Replaces the placeholder in `src/components/Jester.tsx`. Any size works as long as every frame matches.                                                                                        |
| **Jevil animation frames** | 48 × 54 per frame, in a horizontal strip      | Same as above                                                       | Suggested states:<br>idle, 2 frames (the bob)<br>reacting/laughing, 2–4 frames (after a pick)<br>shake, optional (quick picks)                                                                 |
| **Suit icons ♥ ♦ ♣ ♠**     | **9 × 9 px** each (4 files or a 36 × 9 strip) | 2× (18 × 18) on cards and labels                                    | Replaces the ♥ ♦ ♣ ♠ text symbols, which the pixel fonts lack. An odd width gives a centre column for symmetric shapes.                                                                        |
| **App icon**               | **32 × 32 px** art, delivered as **SVG**      | Browser tab, home screen, splash                                    | Replaces `public/icon.svg`. Must stay SVG: some generated sizes (48, 180) are not whole multiples of 32, so a PNG would blur. Keep important art in the middle 80%; Android crops to a circle. |

## Optional

| Asset                       | Size                                             | Purpose                                                                                 |
| --------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Heart cursor / chart marker | 9 × 8 px, shown at 2×                            | Currently drawn in code (`src/components/Heart.tsx`); only if a custom style is wanted. |
| Repo social preview         | **1280 × 640 px** PNG                            | Image shown when the GitHub link is shared.                                             |
| Install screenshots         | **1280 × 720** (wide) and **780 × 1688** (phone) | Adds screenshots to the install prompt on Chrome and Android.                           |
| README title image          | Any, ~1200 px wide                               | Refresh `docs/images/title_img.png` to match the new look.                              |

**No image needed:** the checkered background, pixel borders and answer cards are CSS.

## Export rules

- **PNG at 1× native size, transparent background.** Don't pre-scale; the game scales in code
  with `image-rendering: pixelated` (the `pixelated` utility).
- **No anti-aliasing or soft edges.** Every pixel is fully one colour.
- **Same pixel size across all assets**, so Jevil, suits and icons read as one set.
- **Stick to the theme palette** (defined in `src/index.css`):

  | Token        | Hex       |
  | ------------ | --------- |
  | `void`       | `#0b0614` |
  | `night`      | `#1a0f2e` |
  | `jester-900` | `#2a1450` |
  | `jester-700` | `#4b2a8c` |
  | `jester-500` | `#7b4fd6` |
  | `jester-300` | `#b69cf2` |
  | `gold`       | `#f5d63d` |
  | `teal`       | `#3ec7c2` |
  | `bone`       | `#ece8f4` |
  | `chaos`      | `#e0436b` |

- **Original art only**, in Jevil's style; no ripped sprites or music (see ADR-013 in
  [DECISIONS.md](./DECISIONS.md)).

## Wiring checklist (when assets arrive)

- [ ] Jevil sprite + frames in `Jester.tsx`, with whole-number display sizes per screen
- [ ] Frame animations (idle bob, reaction, optional shake) as stepped CSS animations
- [ ] Suit icon component replacing the text symbols on cards, labels and the results screen
- [ ] New `public/icon.svg`; check generated icons in a production build
- [ ] Offline cache already includes `.png` and `.svg`; confirm the new files are precached
