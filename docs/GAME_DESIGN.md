# Jevil's Dilemma — Game Design

> Living document. Captures the game concept and the twist ideas agreed on so far.
> Technical decisions live in [DECISIONS.md](./DECISIONS.md).

## 1. Origin

Based on the tabletop party game **Dilemma**: a deck of cards, each posing a scenario with
two awkward choices. There are no scores and no winners in the original — the cards exist to
start conversations ("why would you pick _that_?").

Example card:

> **Out on a date, who would you choose?**
> A) Someone dressed perfectly but with absolutely no aroma
> B) Someone with appalling dress sense who smells truly wonderful

## 2. Our version

- **Solo only** (multiplayer is out of scope for now).
- **No server.** Everything runs in the browser; state and history are persisted locally.
- **Installable PWA**, playable offline.
- **Pixel-art presentation** themed around Jevil (Deltarune) — purple/violet base with
  yellow and teal accents, card-suit motifs, carousel/chaos energy.
- Questions are loaded from a **JSON file**.
- At the end, a **results card** the player can save/share as an image.

### The twist: an alignment chart

The original has no scoring. We add a light, playful layer on top **without turning it into a
quiz**: every option carries two hidden scores, and the run ends by placing the player on a
3×3 **alignment chart**.

|             | Lawful         | Neutral      | Chaotic         |
| ----------- | -------------- | ------------ | --------------- |
| **Good**    | Lawful Good    | Neutral Good | Chaotic Good    |
| **Neutral** | Lawful Neutral | True Neutral | Chaotic Neutral |
| **Evil**    | Lawful Evil    | Neutral Evil | Chaotic Evil    |

- **Lawful ↔ Chaotic** fits any card, including silly ones, and suits Jevil ("CHAOS, CHAOS!").
- **Good ↔ Evil** only moves on cards with a moral edge; purely silly options score `0`.
- Each axis is averaged over the run to a value from -1 to 1 and split into thirds, so the
  middle band is Neutral. The heart marker shows the exact point, the highlighted cell the
  alignment.
- Each of the 9 cells has its own Jevil title (see §6).

**Deck balance matters:** if too few cards move the good/evil axis, almost everyone lands in
the middle row. The deck validation should check that a healthy share of options have a
non-zero `good` score.

## 3. Twist ideas

Status: ✅ planned for v1 · 🕓 later

| #   | Idea                              | Status | Notes                                                                                                                        |
| --- | --------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Jevil's Reading**               | ✅ v1  | Final position on the 3×3 alignment chart + a Jevil-style title for that cell. This is the screenshot moment.                |
| 2   | **Jevil reacts to every pick**    | ✅ v1  | Short pixel speech bubble after each answer ("UEE HEE HEE! HOW BORING!"). Keeps the conversational feel in solo play.        |
| 3   | **Chaos Cards**                   | 🕓     | Occasionally Jevil "shuffles": a twisted card, a surprise third option, or swapped options. Nods to his card-carousel fight. |
| 4   | **"Why?" prompt**                 | ✅ v1  | Optional one-line reason after picking. Preserves the open-ended spirit of the original; reasons appear on the results card. |
| 5   | **Hesitation meter**              | ✅ v1  | Time taken per decision. Results highlight "your hardest dilemma". Timer pauses when the tab is hidden.                      |
| 6   | **Deck suits**                    | 🕓     | Categories (romance, morality, absurd, gross…) mapped to ♠ ♥ ♣ ♦. Results show which suit brings out the chaos.              |
| 7   | **Past selves**                   | 🕓     | Keep previous runs locally; Jevil calls out when you answer a repeat card differently.                                       |
| 8   | **Unlockable titles / portraits** | 🕓     | Extreme results unlock rare titles or sprites to collect.                                                                    |
| 9   | **"Think like Jevil" mode**       | 🕓     | Try to pick the chaos option every time; scored at the end.                                                                  |

## 4. Game flow (v1)

1. **Title screen**: Start, plus Continue if a run is in progress.
2. **Card**: question + options (A/B). Hesitation timer starts when the card is shown.
3. **Pick**: Jevil reacts; optional "Why?" field; Next.
4. Repeat for a fixed number of cards (default **10**), never repeating a card within a run.
5. **Results**: alignment chart, Jevil's title, hardest dilemma, answers + reasons.
6. **Save image / Share** and **Play again**.

### Layout

Chosen: **card table** (layout B in `docs/prototypes/layout-demo.html`). Jevil sits in the
corner with a speech bubble, the question is a banner, and the two options are large playing
cards (A ♠ / B ♥) that are dealt in. The picked card lifts; the other tilts away.

The jester sprite in the prototype is a placeholder; final Jevil art will be supplied
separately.

## 5. Card data shape (draft)

```json
{
  "id": "polite-ghost",
  "prompt": "Your home is haunted by an extremely polite ghost.",
  "options": [
    { "id": "a", "text": "Draw up house rules together", "chaos": -1, "good": 1 },
    { "id": "b", "text": "Train it to haunt your rivals", "chaos": 2, "good": -2 }
  ]
}
```

- `chaos`: integer from `-2` (lawful) to `+2` (chaotic).
- `good`: integer from `-2` (evil) to `+2` (good). `0` = no moral weight.
- `id` is a stable, human-readable slug (not random) so saved history survives edits to the deck.
- Card text is original wording, not copied from the commercial deck.

## 6. Alignment titles (draft)

|             | Lawful                    | Neutral                   | Chaotic                        |
| ----------- | ------------------------- | ------------------------- | ------------------------------ |
| **Good**    | A GOLDEN RULE-FOLLOWER    | A KINDLY WANDERER         | A MERRY TRICKSTER              |
| **Neutral** | THE RULEBOOK INCARNATE    | A PERFECTLY SHUFFLED DECK | A TRUE CHAOS FREAK!            |
| **Evil**    | A TYRANT WITH A CLIPBOARD | A SNEAKY LITTLE KNAVE     | A JESTER AFTER MINE OWN HEART! |

Jevil's reaction to a pick follows whichever axis it leans on hardest (lawful, chaotic, good,
evil, or neutral).

## 7. Open questions

- How many cards are in the physical set, and will all of them be transcribed?
- Reaction lines: generic per axis (current), or written per card?
- Minimum share of cards with moral weight, so the good/evil axis is meaningful.
- Art: original pixel art only (see IP note in DECISIONS.md).
