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
- Each question has **three answer cards**.
- At the end, a **results card** the player can download as an image.

### The twist: an alignment chart

The original has no scoring. We add a light, playful layer on top **without turning it into a
quiz**: every answer carries two hidden scores, and the run ends by placing the player on a
3×3 **alignment chart**.

|             | Lawful         | Neutral      | Chaotic         |
| ----------- | -------------- | ------------ | --------------- |
| **Good**    | Lawful Good    | Neutral Good | Chaotic Good    |
| **Neutral** | Lawful Neutral | True Neutral | Chaotic Neutral |
| **Evil**    | Lawful Evil    | Neutral Evil | Chaotic Evil    |

### Scoring rules

**1. Every answer secretly is one alignment.** Each answer has two scores, each `-1`, `0` or
`+1`:

| Score   | -1     | 0       | +1      |
| ------- | ------ | ------- | ------- |
| `chaos` | Lawful | Neutral | Chaotic |
| `good`  | Evil   | Neutral | Good    |

Two scores × three values = nine combinations = the nine cells of the chart.

**2. On every card, the three answers use -1, 0 and +1 exactly once on each axis.** This is
the rule that keeps players guessing:

- The most chaotic answer is never simply "the chaotic one" — it is also good, neutral or
  evil. Every answer is a trade-off, so no single axis can be gamed.
- Each card sums to `0` on both axes, so random clicking drifts to True Neutral; only
  consistent instincts reach a corner.
- Every card can move each axis in either direction.

There are six ways to pair the values (e.g. Lawful Evil / True Neutral / Chaotic Good, or
Lawful Neutral / Neutral Good / Chaotic Evil). **Each suit uses all six**, so no pattern
such as "the chaotic answer is always the kind one" can be learned.

**3. The result.** Each axis is summed over the run and divided by the number of cards,
giving a value from -1 to +1, then split into thirds. Over a 10-card run:

> **A net lean of 4 or more in one direction leaves Neutral on that axis.**
> e.g. 6 chaotic, 2 lawful, 2 neutral picks = net +4 → Chaotic.
> 5 chaotic, 2 lawful, 3 neutral = net +3 → still Neutral.

The heart marker shows the exact point; the highlighted cell is the alignment. Each cell has
its own Jevil title (see §6).

**4. Nothing gives the answer away.** Answer order is shuffled every time a card is dealt, and
Jevil's reactions respond to _how fast_ you chose, never to what the answer scored. The
alignment is only revealed in the final reading.

### Suits

Every question belongs to one of four suits. The deck has **six questions per suit**, and each
run deals **at least two from every suit**.

| Suit       | Theme                             |
| ---------- | --------------------------------- |
| ♥ Hearts   | love, friendship and family       |
| ♦ Diamonds | money, greed and ambition         |
| ♣ Clubs    | society, strangers and the absurd |
| ♠ Spades   | danger, power and survival        |

The results screen shows the player's alignment within each suit, e.g. "saintly in love,
ruthless with money".

## 3. Twist ideas

Status: ✅ in v1 · 🕓 later

| #   | Idea                              | Status | Notes                                                                                                                        |
| --- | --------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Jevil's Reading**               | ✅ v1  | Final position on the 3×3 alignment chart + a Jevil-style title for that cell. This is the screenshot moment.                |
| 2   | **Jevil reacts to every pick**    | ✅ v1  | Short speech bubble after each answer. Deliberately vague: reacts to decision speed, never to the hidden scores.             |
| 3   | **Chaos Cards**                   | 🕓     | Occasionally Jevil "shuffles": a twisted card, a surprise extra answer, or swapped answers. Nods to his card-carousel fight. |
| 4   | **"Why?" prompt**                 | ✅ v1  | Optional one-line reason after picking. Preserves the open-ended spirit of the original; reasons appear on the results card. |
| 5   | **Hesitation meter**              | ✅ v1  | Time taken per decision. Results highlight "your hardest dilemma". Timer pauses when the tab is hidden.                      |
| 6   | **Deck suits**                    | ✅ v1  | Every question has a suit (see §2). Results show the player's alignment per suit.                                            |
| 7   | **Past selves**                   | 🕓     | Keep previous runs locally; Jevil calls out when you answer a repeat card differently.                                       |
| 8   | **Unlockable titles / portraits** | 🕓     | Extreme results unlock rare titles or sprites to collect.                                                                    |
| 9   | **"Think like Jevil" mode**       | 🕓     | Try to find the chaotic answer on every card; scored at the end.                                                             |

## 4. Game flow (v1)

1. **Title screen**: Start, plus Continue if a run is in progress.
2. **Card**: suit + question + three answer cards (A/B/C, shuffled). Hesitation timer starts
   when the card is shown.
3. **Pick**: Jevil reacts; optional "Why?" field; Next.
4. Repeat for a fixed number of cards (default **10**, at least two per suit), never repeating
   a card within a run.
5. **Results**: alignment chart, Jevil's title, hardest and quickest decisions, alignment by
   suit, answers + reasons.
6. **Save image** (downloads a PNG) and **Play again**.

### Layout

Chosen: **card table** (layout B in `docs/prototypes/layout-demo.html`). Jevil sits in the
corner with a speech bubble, the question is a banner under its suit, and the three answers
are large playing cards that are dealt in (side by side on wide screens, stacked on phones).
The picked card lifts; the others tilt away.

The prototype predates the three-answer change and still shows two answers. The jester
sprite and suit symbols are placeholders; final art will be supplied separately.

## 5. Card data shape

```json
{
  "id": "generous-atm",
  "suit": "diamonds",
  "prompt": "A cash machine gives you double what you asked for.",
  "options": [
    { "id": "a", "text": "Report it to the bank, as you're supposed to", "chaos": -1, "good": 0 },
    { "id": "b", "text": "Keep it. The bank will never notice", "chaos": 0, "good": -1 },
    { "id": "c", "text": "Spend it on pizza for the whole street", "chaos": 1, "good": 1 }
  ]
}
```

- `suit`: `hearts`, `diamonds`, `clubs` or `spades`.
- `chaos`: `-1` (lawful), `0` or `+1` (chaotic). `good`: `-1` (evil), `0` or `+1` (good).
- Across a card's three answers, each score uses `-1`, `0` and `+1` once (enforced by the
  schema).
- Answer ids `a`/`b`/`c` identify answers in saves; the letters shown on screen are by
  position, because order is shuffled.
- `id` is a stable, human-readable slug (not random) so saved history survives edits to the deck.
- Card text is original wording, not copied from the commercial deck.

## 6. Alignment titles (draft)

|             | Lawful                    | Neutral                   | Chaotic                        |
| ----------- | ------------------------- | ------------------------- | ------------------------------ |
| **Good**    | A GOLDEN RULE-FOLLOWER    | A KINDLY WANDERER         | A MERRY TRICKSTER              |
| **Neutral** | THE RULEBOOK INCARNATE    | A PERFECTLY SHUFFLED DECK | A TRUE CHAOS FREAK!            |
| **Evil**    | A TYRANT WITH A CLIPBOARD | A SNEAKY LITTLE KNAVE     | A JESTER AFTER MINE OWN HEART! |

## 7. Open questions

- Pixel-art suit icons: the pixel fonts have no ♥ ♦ ♣ ♠ glyphs, so the symbols currently fall
  back to a system font. Planned with the other image assets.
- Art: original pixel art only (see IP note in DECISIONS.md).
