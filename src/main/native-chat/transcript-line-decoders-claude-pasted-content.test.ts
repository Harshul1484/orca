import { describe, expect, it } from 'vitest'
import {
  normalizeNativeChatUserText,
  normalizedNativeChatUserMessageText
} from '../../shared/native-chat-image-transcript-markers'
import { decodeClaudeTranscriptLine } from './transcript-line-decoders-claude'

const PROMPT = 'Summarize the failing tests.\n\nThen propose a fix for each one.'

function userLine(content: unknown, type: 'user' | 'assistant' = 'user'): string {
  return JSON.stringify({ type, uuid: 'turn-1', message: { role: type, content } })
}

// Shape Claude Code 2.1.283 records for a pasted multi-line prompt.
const PASTED_PROMPT = `\n\n<pasted_content id="7e64">\n${PROMPT}\n</pasted_content id="7e64">\n`

describe('decodeClaudeTranscriptLine on a pasted multi-line prompt', () => {
  it('shows the prompt without the pasted_content wrapper', () => {
    const message = decodeClaudeTranscriptLine(userLine(PASTED_PROMPT), 'fallback')
    expect(message?.role).toBe('user')
    expect(message?.blocks).toEqual([{ type: 'text', text: PROMPT }])
  })

  it('normalizes to the composer text so the optimistic echo can retire', () => {
    const message = decodeClaudeTranscriptLine(userLine(PASTED_PROMPT), 'fallback')!
    expect(normalizedNativeChatUserMessageText(message)).toBe(normalizeNativeChatUserText(PROMPT))
  })

  it('unwraps a text block in array content and CRLF line endings', () => {
    const crlf = `<pasted_content id="a1">\r\n${PROMPT}\r\n</pasted_content id="a1">`
    const message = decodeClaudeTranscriptLine(userLine([{ type: 'text', text: crlf }]), 'fb')
    expect(message?.blocks).toEqual([{ type: 'text', text: PROMPT }])
  })

  it('keeps text around a paste, since the whole turn is not the paste', () => {
    const text = `Please review this:\n<pasted_content id="7e64">\n${PROMPT}\n</pasted_content id="7e64">`
    const message = decodeClaudeTranscriptLine(userLine(text), 'fallback')
    expect(message?.blocks).toEqual([{ type: 'text', text }])
  })

  it('keeps a wrapper whose closing id does not match', () => {
    const text = `<pasted_content id="7e64">\n${PROMPT}\n</pasted_content id="0000">`
    const message = decodeClaudeTranscriptLine(userLine(text), 'fallback')
    expect(message?.blocks).toEqual([{ type: 'text', text }])
  })

  it('leaves assistant text that quotes the wrapper untouched', () => {
    const message = decodeClaudeTranscriptLine(userLine(PASTED_PROMPT, 'assistant'), 'fallback')
    expect(message?.blocks).toEqual([{ type: 'text', text: PASTED_PROMPT }])
  })
})
