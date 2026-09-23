import type { EthicAxis, MoralAxis, Reaction } from './alignment'

/** Jevil's lines after a pick, keyed by the axis the pick leans on hardest. */
export const REACTION_LINES: Record<Reaction, readonly string[]> = {
  lawful: ['BORING! BORING!!', 'A PERFECT LITTLE SQUARE!', 'HOW SENSIBLE. HOW DULL.'],
  chaotic: [
    'UEE HEE HEE! NOW WE PLAY!',
    'DELIGHTFUL! SIMPLY DELIGHTFUL!',
    'THE CAROUSEL SPINS FASTER!',
  ],
  good: ['UGH, HOW NOBLE.', 'A HERO! HOW TERRIBLY SWEET.'],
  evil: ['OHO! WICKED! I LOVE IT!', 'NAUGHTY, NAUGHTY!'],
  neutral: ['A COIN THAT LANDS ON ITS EDGE!'],
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

export function reactionLine(reaction: Reaction, random: () => number = Math.random): string {
  const lines = REACTION_LINES[reaction]
  return lines[Math.floor(random() * lines.length)] ?? lines[0] ?? ''
}
