/** Browser APIs used to trigger a download; injectable so the logic is testable. */
export interface DownloadEnvironment {
  document: { createElement(tag: 'a'): Pick<HTMLAnchorElement, 'href' | 'download' | 'click'> }
  url: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'>
}

const browserEnvironment = (): DownloadEnvironment => ({ document, url: URL })

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

/** Saves the blob as a file via a temporary object URL and a download link. */
export function downloadFile(
  blob: Blob,
  filename: string,
  env: DownloadEnvironment = browserEnvironment(),
): void {
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
}

/** e.g. "Chaotic Neutral" -> "jevils-dilemma-chaotic-neutral.png" */
export function resultFilename(label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `jevils-dilemma-${slug}.png`
}
