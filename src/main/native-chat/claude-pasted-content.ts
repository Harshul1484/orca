// Why: Claude Code records a pasted multi-line prompt wrapped in
// `<pasted_content id="…">` tags. Orca's composer sends every multi-line prompt
// as a paste, so the wrapper would show in the user bubble and stop the turn
// from matching the composer's optimistic echo.
const PASTED_CONTENT_WRAPPER =
  /^\s*<pasted_content(?: id="([^"<>\r\n]{1,64})")?>\r?\n([\s\S]*?)\r?\n<\/pasted_content(?: id="\1")?>\s*$/

/** The pasted text when `text` is exactly one wrapped paste, else `text` unchanged. */
export function unwrapClaudePastedContent(text: string): string {
  return PASTED_CONTENT_WRAPPER.exec(text)?.[2] ?? text
}
