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

### The CHAOS card (card 10)

The 10th card of every run is the **CHAOS card**. It is an ordinary question from the deck,
but instead of its three normal answers it shows **four drastic answers, one for each corner**
of the chart, so there is no safe way out:

| Drastic answer | `chaos` | `good` |
| -------------- | ------- | ------ |
| Lawful Good    | -1      | +1     |
| Chaotic Good   | +1      | +1     |
| Lawful Evil    | -1      | -1     |
| Chaotic Evil   | +1      | -1     |
| **Sum**        | **0**   | **0**  |

- **Every pick is a big swing.** Each drastic answer is extreme on both axes, and the CHAOS
  pick counts **×3** (`CHAOS_WEIGHT`).
- **Still a mystery.** Every answer is drastic, so "drastic" does not give the direction away.
- **Still balanced.** The four corners cancel out, so random picking stays neutral on average.

The result becomes a weighted average:

> result = (sum of the 9 normal picks + 3 × CHAOS pick) ÷ 12

Whatever the player picks moves each axis by ±0.25. A result near the centre is pushed most of
the way to a corner, and a borderline one can flip; nine cards of consistent play can still
hold their ground.

The CHAOS card is announced ("CHAOS, CHAOS! NO SAFE CHOICES NOW!") with its own banner and
card style. The reading says what it did: "The CHAOS card dragged thee into Lawful Evil!" or
"Even the CHAOS card could not budge thee!". Per-suit alignments count the CHAOS pick once,
so one card cannot dominate a suit's small sample.

## 3. Twist ideas

Status: ✅ in v1 · 🕓 later

| #   | Idea                              | Status | Notes                                                                                                                        |
| --- | --------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Jevil's Reading**               | ✅ v1  | Final position on the 3×3 alignment chart + a Jevil-style title for that cell. This is the screenshot moment.                |
| 2   | **Jevil reacts to every pick**    | ✅ v1  | Short speech bubble after each answer. Deliberately vague: reacts to decision speed, never to the hidden scores.             |
| 3   | **CHAOS card**                    | ✅ v1  | Card 10 shows four drastic, corner answers that count ×3 (see §2).                                                           |
| 4   | **"Why?" prompt**                 | ✅ v1  | Optional one-line reason after picking. Preserves the open-ended spirit of the original; reasons appear on the results card. |
| 5   | **Hesitation meter**              | ✅ v1  | Time taken per decision. Results highlight "your hardest dilemma". Timer pauses when the tab is hidden.                      |
| 6   | **Deck suits**                    | ✅ v1  | Every question has a suit (see §2). Results show the player's alignment per suit.                                            |
| 7   | **Past selves**                   | 🕓     | Keep previous runs locally; Jevil calls out when you answer a repeat card differently.                                       |
| 8   | **Unlockable titles / portraits** | 🕓     | Extreme results unlock rare titles or sprites to collect.                                                                    |
| 9   | **"Think like Jevil" mode**       | 🕓     | Try to find the chaotic answer on every card; scored at the end.                                                             |

## 4. Game flow (v1)

1. **Title screen**: Start, plus Continue if a run is in progress.
2. **Card**: suit + question + three answer cards (A/B/C, shuffled). Hesitation timer starts
   when the card is shown. Card 10 is the **CHAOS card**: four drastic answers (A–D), ×3.
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
  ],
  "chaosOptions": [
    {
      "id": "w",
      "text": "Return the money, with a written report on how to fix the machine",
      "chaos": -1,
      "good": 1
    },
    {
      "id": "x",
      "text": "Keep withdrawing all night and hand the cash out to strangers",
      "chaos": 1,
      "good": 1
    },
    {
      "id": "y",
      "text": "Report it, and demand a reward for your honesty",
      "chaos": -1,
      "good": -1
    },
    {
      "id": "z",
      "text": "Tell the whole internet where the broken machine is",
      "chaos": 1,
      "good": -1
    }
  ]
}
```

- `suit`: `hearts`, `diamonds`, `clubs` or `spades`.
- `chaos`: `-1` (lawful), `0` or `+1` (chaotic). `good`: `-1` (evil), `0` or `+1` (good).
- Across a card's three answers, each score uses `-1`, `0` and `+1` once (enforced by the
  schema).
- `chaosOptions`: the four drastic answers for when the card is dealt as the CHAOS card.
  Scores are `-1` or `+1` only, and the four must cover every corner once (enforced by the
  schema).
- Answer ids (`a`/`b`/`c`, and `w`/`x`/`y`/`z` for CHAOS answers) identify answers in saves;
  the letters shown on screen are by position, because order is shuffled.
- `id` is a stable, human-readable slug (not random) so saved history survives edits to the deck.
- Card text is original wording, not copied from the commercial deck.

## 6. The reading

The reading has three lines: a **title**, a **verdict** and a **suit line**. Text lives in
`src/game/copy.ts`; the logic in `src/game/reading.ts`.

### Titles: 9 cells × 3 tiers = 27

The tier depends on how deep into its cell the result lands (0 = on a border, 1 = as deep as
possible; for a neutral axis, "deep" means close to the centre). The two axes are averaged:
below 1/3 is **slight**, below 2/3 **solid**, otherwise **pure**.

| Alignment       | Slight                  | Solid                          | Pure                         |
| --------------- | ----------------------- | ------------------------------ | ---------------------------- |
| Lawful Good     | A MOSTLY DECENT CITIZEN | A GOLDEN RULE-FOLLOWER         | A PALADIN OF PAPERWORK       |
| Neutral Good    | A SOFT-HEARTED STROLLER | A KINDLY WANDERER              | A SAINT IN JESTER'S CLOTHING |
| Chaotic Good    | A CHEEKY DO-GOODER      | A MERRY TRICKSTER              | A ROBIN HOOD OF THE CAROUSEL |
| Lawful Neutral  | A FAN OF THE FINE PRINT | THE RULEBOOK INCARNATE         | A CLOCKWORK BUREAUCRAT       |
| True Neutral    | A SLIGHTLY WOBBLY COIN  | A PERFECTLY SHUFFLED DECK      | THE UNREADABLE CARD          |
| Chaotic Neutral | A LITTLE WILD CARD      | A TRUE CHAOS FREAK!            | CHAOS, CHAOS INCARNATE!      |
| Lawful Evil     | A PETTY OFFICIAL        | A TYRANT WITH A CLIPBOARD      | AN EMPEROR OF CRUEL DECREES  |
| Neutral Evil    | A SNEAKY SNACK THIEF    | A SNEAKY LITTLE KNAVE          | A SHADOW IN THE CASTLE       |
| Chaotic Evil    | A MISCHIEF MAKER        | A JESTER AFTER MINE OWN HEART! | A DEVILSKNIFE IN HUMAN FORM  |

### Verdicts: 3 per cell = 27

One is chosen from a hash of the run's answers, so a given run always shows the same line
(on screen and in the saved image), while different runs in the same cell vary.

### Suit line

Names the suit where the player leaned hardest and which way, e.g. "♦ Most ruthless with
money." If no suit leaves the neutral band: "Steady in every suit. How dull!"

| Leaning | Word          |     | Suit     | Context                |
| ------- | ------------- | --- | -------- | ---------------------- |
| Lawful  | Strictest     |     | Hearts   | in love and friendship |
| Chaotic | Wildest       |     | Diamonds | with money             |
| Good    | Kindest       |     | Clubs    | among strangers        |
| Evil    | Most ruthless |     | Spades   | when danger calls      |

## 7. Open questions

- Pixel-art suit icons: the pixel fonts have no ♥ ♦ ♣ ♠ glyphs, so the symbols currently fall
  back to a system font. Planned with the other image assets (see [ASSETS.md](./ASSETS.md)).
- Art: original pixel art only (see IP note in DECISIONS.md).
