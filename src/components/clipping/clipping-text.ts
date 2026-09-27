/**
 * Kindle exports join multi-paragraph highlights with "•" and sometimes keep
 * footnote markers like "[12]". Returns the readable paragraphs.
 */
export function splitClippingLines(content: string, maxLines = 0): string[] {
  const lines = content
    .replace(/\[\d*\]/g, '')
    .split('•')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  return maxLines > 0 ? lines.slice(0, maxLines) : lines
}
