export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled'

/** Browser APIs used for sharing; injectable so the logic is testable outside a browser. */
export interface ShareEnvironment {
  navigator: Partial<Pick<Navigator, 'canShare' | 'share'>>
  document: { createElement(tag: 'a'): Pick<HTMLAnchorElement, 'href' | 'download' | 'click'> }
  url: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'>
}

const browserEnvironment = (): ShareEnvironment => ({ navigator, document, url: URL })

/**
 * Renders a DOM node to a PNG. The library is loaded on demand so it only costs
 * bandwidth for players who actually save their result.
 */
export async function renderToPng(node: HTMLElement, background: string): Promise<Blob> {
  const { toBlob } = await import('html-to-image')
  const blob = await toBlob(node, { pixelRatio: 2, backgroundColor: background })
  if (!blob) throw new Error('Rendering the result image produced no data')
  return blob
}

/**
 * Opens the native share sheet where files can be shared (mostly mobile), otherwise
 * downloads the file. A share the player dismisses counts as cancelled, not failed.
 */
export async function shareOrDownload(
  blob: Blob,
  filename: string,
  env: ShareEnvironment = browserEnvironment(),
): Promise<ShareOutcome> {
  const file = new File([blob], filename, { type: blob.type || 'image/png' })

  if (env.navigator.share && env.navigator.canShare?.({ files: [file] })) {
    try {
      await env.navigator.share({ files: [file], title: "Jevil's Dilemma" })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
      throw error
    }
  }

  const href = env.url.createObjectURL(blob)
  try {
    const link = env.document.createElement('a')
    link.href = href
    link.download = filename
    link.click()
  } finally {
    // Revoke after the click has been handled so the download can start.
    setTimeout(() => env.url.revokeObjectURL(href), 0)
  }
  return 'downloaded'
}

/** e.g. "Chaotic Neutral" -> "jevils-dilemma-chaotic-neutral.png" */
export function resultFilename(label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `jevils-dilemma-${slug}.png`
}
