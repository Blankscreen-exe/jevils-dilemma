import type { EthicAxis, MoralAxis } from './alignment'
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
  title: string
  verdict: string
}

type AlignmentKey = `${MoralAxis}-${EthicAxis}`

export const ALIGNMENT_COPY: Record<AlignmentKey, AlignmentCopy> = {
  'good-lawful': {
    label: 'Lawful Good',
    title: 'A GOLDEN RULE-FOLLOWER',
    verdict: 'Thou dost good, and by the book.',
  },
  'good-neutral': {
    label: 'Neutral Good',
    title: 'A KINDLY WANDERER',
    verdict: 'Good for goodness’ sake. How quaint!',
  },
  'good-chaotic': {
    label: 'Chaotic Good',
    title: 'A MERRY TRICKSTER',
    verdict: 'Chaos, but make it charitable!',
  },
  'neutral-lawful': {
    label: 'Lawful Neutral',
    title: 'THE RULEBOOK INCARNATE',
    verdict: 'Rules for rules’ sake. Yawn.',
  },
  'neutral-neutral': {
    label: 'True Neutral',
    title: 'A PERFECTLY SHUFFLED DECK',
    verdict: 'Balanced. Unreadable. Suspicious.',
  },
  'neutral-chaotic': {
    label: 'Chaotic Neutral',
    title: 'A TRUE CHAOS FREAK!',
    verdict: 'Thou art free. Just like me!',
  },
  'evil-lawful': {
    label: 'Lawful Evil',
    title: 'A TYRANT WITH A CLIPBOARD',
    verdict: 'Wickedness, filed in triplicate.',
  },
  'evil-neutral': {
    label: 'Neutral Evil',
    title: 'A SNEAKY LITTLE KNAVE',
    verdict: 'Thou lookest out for thyself alone.',
  },
  'evil-chaotic': {
    label: 'Chaotic Evil',
    title: 'A JESTER AFTER MINE OWN HEART!',
    verdict: 'UEE HEE HEE! Let us burn the castle!',
  },
}

export function alignmentCopy(moral: MoralAxis, ethic: EthicAxis): AlignmentCopy {
  return ALIGNMENT_COPY[`${moral}-${ethic}`]
}

export function reactionLine(pace: Pace, random: () => number = Math.random): string {
  const lines = REACTION_LINES[pace]
  return lines[Math.floor(random() * lines.length)] ?? lines[0] ?? ''
}
