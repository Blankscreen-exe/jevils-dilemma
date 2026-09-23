import type { EthicAxis, MoralAxis, Tier } from './alignment'
import type { Suit } from './deck'

export interface SuitCopy {
  symbol: string
  name: string
  theme: string
}

export const SUIT_COPY: Record<Suit, SuitCopy> = {
  hearts: { symbol: '♥', name: 'HEARTS', theme: 'love, friendship and family' },
  diamonds: { symbol: '♦', name: 'DIAMONDS', theme: 'money, greed and ambition' },
  clubs: { symbol: '♣', name: 'CLUBS', theme: 'society, strangers and the absurd' },
  spades: { symbol: '♠', name: 'SPADES', theme: 'danger, power and survival' },
}

export type Pace = 'quick' | 'steady' | 'slow'

/** Decisions faster or slower than these (ms) get their own reactions. */
export const QUICK_MS = 2500
export const SLOW_MS = 10_000

export function paceOf(elapsedMs: number): Pace {
  if (elapsedMs < QUICK_MS) return 'quick'
  if (elapsedMs > SLOW_MS) return 'slow'
  return 'steady'
}

/**
 * Jevil's lines after a pick. They react to how the player chose, never to what the
 * answer scored, so the hidden alignment stays hidden until the reading.
 */
export const REACTION_LINES: Record<Pace, readonly string[]> = {
  quick: ['SO QUICK! SO SURE!', 'NO HESITATION? DELICIOUS!', 'SNAP! JUST LIKE THAT!'],
  steady: [
    'OHO? INTERESTING...',
    'HOW VERY LIKE YOU!',
    'I SEE, I SEE...',
    'UEE HEE! NOTED!',
    'THE CAROUSEL TURNS...',
  ],
  slow: ['TOOK THY SWEET TIME, DIDST THOU?', 'SUCH AGONY! I LOVE IT!', 'TICK TOCK, TICK TOCK!'],
}

export interface AlignmentCopy {
  label: string
  /** One title per tier: just over the line, a clear result, the extreme. */
  titles: Record<Tier, string>
  /** Several lines so repeat results still feel fresh; one is chosen per run. */
  verdicts: readonly string[]
}

type AlignmentKey = `${MoralAxis}-${EthicAxis}`

export const ALIGNMENT_COPY: Record<AlignmentKey, AlignmentCopy> = {
  'good-lawful': {
    label: 'Lawful Good',
    titles: {
      slight: 'A MOSTLY DECENT CITIZEN',
      solid: 'A GOLDEN RULE-FOLLOWER',
      pure: 'A PALADIN OF PAPERWORK',
    },
    verdicts: [
      'Thou dost good, and by the book.',
      'Kindness, filed in the proper order!',
      'A hero with a permission slip. Adorable!',
    ],
  },
  'good-neutral': {
    label: 'Neutral Good',
    titles: {
      slight: 'A SOFT-HEARTED STROLLER',
      solid: 'A KINDLY WANDERER',
      pure: "A SAINT IN JESTER'S CLOTHING",
    },
    verdicts: [
      'Good for goodness’ sake. How quaint!',
      'Thou helpest whoever stands before thee.',
      'No rules, no chaos. Just... niceness. Ugh.',
    ],
  },
  'good-chaotic': {
    label: 'Chaotic Good',
    titles: {
      slight: 'A CHEEKY DO-GOODER',
      solid: 'A MERRY TRICKSTER',
      pure: 'A ROBIN HOOD OF THE CAROUSEL',
    },
    verdicts: [
      'Chaos, but make it charitable!',
      'Thou breakest rules to save the day!',
      'A rebel with a heart of gold. How delicious!',
    ],
  },
  'neutral-lawful': {
    label: 'Lawful Neutral',
    titles: {
      slight: 'A FAN OF THE FINE PRINT',
      solid: 'THE RULEBOOK INCARNATE',
      pure: 'A CLOCKWORK BUREAUCRAT',
    },
    verdicts: [
      'Rules for rules’ sake. Yawn.',
      'Thou wouldst queue for a queue.',
      'Order! Order! Such dreadful order!',
    ],
  },
  'neutral-neutral': {
    label: 'True Neutral',
    titles: {
      slight: 'A SLIGHTLY WOBBLY COIN',
      solid: 'A PERFECTLY SHUFFLED DECK',
      pure: 'THE UNREADABLE CARD',
    },
    verdicts: [
      'Balanced. Unreadable. Suspicious.',
      'Neither saint nor sinner. How mysterious!',
      'Thou art the eye of the storm!',
    ],
  },
  'neutral-chaotic': {
    label: 'Chaotic Neutral',
    titles: {
      slight: 'A LITTLE WILD CARD',
      solid: 'A TRUE CHAOS FREAK!',
      pure: 'CHAOS, CHAOS INCARNATE!',
    },
    verdicts: [
      'Thou art free. Just like me!',
      'Rules? Never heard of them!',
      'The carousel spins, and thou spinnest with it!',
    ],
  },
  'evil-lawful': {
    label: 'Lawful Evil',
    titles: {
      slight: 'A PETTY OFFICIAL',
      solid: 'A TYRANT WITH A CLIPBOARD',
      pure: 'AN EMPEROR OF CRUEL DECREES',
    },
    verdicts: [
      'Wickedness, filed in triplicate.',
      'Thou followest the rules... straight to the top.',
      'Cruelty with a stamp of approval!',
    ],
  },
  'evil-neutral': {
    label: 'Neutral Evil',
    titles: {
      slight: 'A SNEAKY SNACK THIEF',
      solid: 'A SNEAKY LITTLE KNAVE',
      pure: 'A SHADOW IN THE CASTLE',
    },
    verdicts: [
      'Thou lookest out for thyself alone.',
      'What’s thine is thine. What’s theirs is also thine!',
      'No friend, no foe. Only profit.',
    ],
  },
  'evil-chaotic': {
    label: 'Chaotic Evil',
    titles: {
      slight: 'A MISCHIEF MAKER',
      solid: 'A JESTER AFTER MINE OWN HEART!',
      pure: 'A DEVILSKNIFE IN HUMAN FORM',
    },
    verdicts: [
      'UEE HEE HEE! Let us burn the castle!',
      'Thou wouldst trip a knight for fun!',
      'Finally, a worthy playmate! CHAOS, CHAOS!',
    ],
  },
}

export function alignmentCopy(moral: MoralAxis, ethic: EthicAxis): AlignmentCopy {
  return ALIGNMENT_COPY[`${moral}-${ethic}`]
}

/** How each leaning is described in the suit line, e.g. "Most ruthless with money." */
export const LEANING_WORDS: Record<'lawful' | 'chaotic' | 'good' | 'evil', string> = {
  lawful: 'Strictest',
  chaotic: 'Wildest',
  good: 'Kindest',
  evil: 'Most ruthless',
}

/** Where each suit's dilemmas happen, completing the suit line. */
export const SUIT_CONTEXT: Record<Suit, string> = {
  hearts: 'in love and friendship',
  diamonds: 'with money',
  clubs: 'among strangers',
  spades: 'when danger calls',
}

export const STEADY_SUIT_LINE = 'Steady in every suit. How dull!'

export function reactionLine(pace: Pace, random: () => number = Math.random): string {
  const lines = REACTION_LINES[pace]
  return lines[Math.floor(random() * lines.length)] ?? lines[0] ?? ''
}
