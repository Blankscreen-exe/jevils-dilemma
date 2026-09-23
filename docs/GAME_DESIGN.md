# Jevil's Dilemma — Game Design

> Living document. Captures the game concept and the twist ideas agreed on so far.
> Technical decisions live in [DECISIONS.md](./DECISIONS.md).

## 1. Origin

Based on the tabletop party game **Dilemma**: a deck of cards, each posing a scenario with
two awkward choices. There are no scores and no winners in the original — the cards exist to
start conversations ("why would you pick *that*?").

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

### The twist

The original has no scoring. We add a light, playful layer on top **without turning it into a
quiz**: every option carries a hidden lean on an **Order ↔ Chaos** axis. Most cards are not
moral questions (see the example above), so a good/evil axis would feel arbitrary; Order/Chaos
works for any card and fits Jevil ("CHAOS, CHAOS!").

## 3. Twist ideas

Status: ✅ planned for v1 · 🕓 later

| # | Idea | Status | Notes |
|---|------|--------|-------|
| 1 | **Jevil's Reading** | ✅ v1 | Final Order↔Chaos position + a Jevil-style title (e.g. *"A TRUE CHAOS FREAK!"*). This is the screenshot moment. |
| 2 | **Jevil reacts to every pick** | ✅ v1 | Short pixel speech bubble after each answer ("UEE HEE HEE! HOW BORING!"). Keeps the conversational feel in solo play. |
| 3 | **Chaos Cards** | 🕓 | Occasionally Jevil "shuffles": a twisted card, a surprise third option, or swapped options. Nods to his card-carousel fight. |
| 4 | **"Why?" prompt** | ✅ v1 | Optional one-line reason after picking. Preserves the open-ended spirit of the original; reasons appear on the results card. |
| 5 | **Hesitation meter** | ✅ v1 | Time taken per decision. Results highlight "your hardest dilemma". Timer pauses when the tab is hidden. |
| 6 | **Deck suits** | 🕓 | Categories (romance, morality, absurd, gross…) mapped to ♠ ♥ ♣ ♦. Results show which suit brings out the chaos. |
| 7 | **Past selves** | 🕓 | Keep previous runs locally; Jevil calls out when you answer a repeat card differently. |
| 8 | **Unlockable titles / portraits** | 🕓 | Extreme results unlock rare titles or sprites to collect. |
| 9 | **"Think like Jevil" mode** | 🕓 | Try to pick the chaos option every time; scored at the end. |

## 4. Game flow (v1)

1. **Title screen** — Start, plus Continue if a run is in progress.
2. **Card** — question + options (A/B). Hesitation timer starts when the card is shown.
3. **Pick** — Jevil reacts; optional "Why?" field; Next.
4. Repeat for a fixed number of cards (default **10**), never repeating a card within a run.
5. **Results** — Order↔Chaos meter, Jevil's title, hardest dilemma, answers + reasons.
6. **Save image / Share** and **Play again**.

## 5. Card data shape (draft)

```json
{
  "id": "date-dress-vs-scent",
  "category": "romance",
  "prompt": "Out on a date, who would you choose?",
  "options": [
    { "id": "a", "text": "Someone dressed perfectly but with absolutely no aroma", "lean": -1 },
    { "id": "b", "text": "Someone with appalling dress sense who smells truly wonderful", "lean": 1 }
  ]
}
```

- `lean`: integer from `-2` (order) to `+2` (chaos). `0` = neutral.
- `id` is a stable, human-readable slug (not random) so saved history survives edits to the deck.

## 6. Open questions

- How many cards are in the physical set, and will all of them be transcribed?
- Final list of Jevil titles and the score ranges that map to them.
- Reaction lines: generic per lean, or written per card?
- Art: original pixel art only (see IP note in DECISIONS.md).
