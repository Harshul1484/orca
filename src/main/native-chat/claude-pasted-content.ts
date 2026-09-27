// Why: Claude Code wraps a pasted multi-line prompt in `<pasted_content id="…">` tags.
const PASTED_CONTENT_WRAPPER =
  /^\s*<pasted_content(?: id="([^"<>\r\n]{1,64})")?>\r?\n([\s\S]*?)\r?\n<\/pasted_content(?: id="\1")?>\s*$/

export function unwrapClaudePastedContent(text: string): string {
  return PASTED_CONTENT_WRAPPER.exec(text)?.[2] ?? text
}
