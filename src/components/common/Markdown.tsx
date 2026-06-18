import type { CSSProperties } from 'react'
import ReactMarkdown from 'react-markdown'
import refractor from 'refractor/core'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'

SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('tsx', tsx)
// refractor.registerLanguage ignores the name arg (it keys off displayName),
// so short forms must be set up as explicit aliases.
SyntaxHighlighter.alias('python', ['py'])
SyntaxHighlighter.alias('bash', ['sh'])
SyntaxHighlighter.alias('tsx', ['ts'])

// Extend the live Python grammar so `self`/`cls` tokenize as keywords (Prism
// leaves them as plain identifiers by default). The `keyword` alias makes them
// pick up the blue keyword style. PrismLight shares this `refractor/core`
// singleton, so the edit applies to the grammar it renders with.
;(refractor as unknown as { languages: Record<string, any> }).languages.insertBefore?.(
  'python',
  'keyword',
  { 'keyword-self': { pattern: /\b(?:cls|self)\b/, alias: 'keyword' } },
)

const PROSE_CLASSES = `prose prose-invert prose-sm max-w-none
  prose-headings:text-[var(--gray-200)] prose-headings:font-bold prose-headings:tracking-wider
  prose-h1:text-fluid-h1 prose-h1:mb-6 prose-h1:mt-0
  prose-h2:text-fluid-h2 prose-h2:mb-4 prose-h2:mt-8
  prose-h3:text-fluid-h3 prose-h3:mb-3 prose-h3:mt-6
  prose-h4:text-fluid-h4 prose-h4:mb-2 prose-h4:mt-4 prose-h4:text-[var(--gray-400)]
  prose-p:text-[var(--gray-400)] prose-p:font-light prose-p:leading-relaxed prose-p:text-fluid-base prose-p:[overflow-wrap:break-word]
  prose-em:text-[var(--gray-200)] prose-em:italic
  prose-strong:text-[var(--highlight)] prose-strong:font-medium
  prose-ul:space-y-2 prose-ul:my-4
  prose-li:text-[var(--gray-400)] prose-li:font-light prose-li:text-fluid-base prose-li:pl-4 prose-li:border-l prose-li:border-white/5
  prose-code:text-[var(--highlight)] prose-code:bg-white/[0.12] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-fluid-sm prose-code:font-normal prose-code:[text-transform:none] prose-code:break-words prose-code:before:content-[''] prose-code:after:content-['']
  prose-pre:rounded-md
  prose-a:text-[var(--highlight)] prose-a:no-underline prose-a:break-words hover:prose-a:underline`

// Minimal theme: code stays a flat, readable gray (--gray-200) with no
// per-token highlighting — only keywords (for/while/if/elif/break/not/self/…)
// are colored blue. Any token type without an entry below inherits the base
// gray, so punctuation/operators/strings read at full brightness rather than
// dimmed. text-transform:none keeps code case intact despite the global
// lowercase body transform.
const base: CSSProperties = {
  color: '#cccccc',
  fontFamily: "'Ioskeley Mono', monospace",
  fontSize: 'clamp(12px, 0.31vw + 8px, 16px)',
  lineHeight: 1.6,
  textTransform: 'none',
  fontWeight: 300,
}

const monochromeTheme: Record<string, CSSProperties> = {
  'code[class*="language-"]': base,
  'pre[class*="language-"]': { ...base, margin: 0, background: 'transparent' },
  comment: { color: '#777777', fontStyle: 'italic' },
  keyword: { color: '#6ea8fe', fontWeight: 500 },
}

interface MarkdownProps {
  content: string
}

export function Markdown({ content }: MarkdownProps) {
  return (
    <div className={PROSE_CLASSES}>
      <ReactMarkdown
        components={{
          // SyntaxHighlighter renders its own <pre>, so unwrap react-markdown's.
          pre: ({ children }) => <>{children}</>,
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const text = String(children).replace(/\n$/, '')
            const isBlock = Boolean(match) || text.includes('\n')

            if (isBlock) {
              return (
                <SyntaxHighlighter
                  language={match?.[1] ?? 'text'}
                  style={monochromeTheme}
                  customStyle={{
                    background: '#161616',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    padding: '14px 16px',
                    margin: '1rem 0',
                    overflowX: 'auto',
                  }}
                  codeTagProps={{
                    // Neutralize the prose-code inline-code pill (bg/padding/
                    // rounded) that .prose :where(code) otherwise applies to
                    // this block's <code>. Inline style beats the prose rule.
                    style: {
                      textTransform: 'none',
                      background: 'transparent',
                      padding: 0,
                      borderRadius: 0,
                      fontSize: 'clamp(12px, 0.31vw + 8px, 16px)',
                      fontWeight: 300,
                      color: '#cccccc',
                    },
                  }}
                >
                  {text}
                </SyntaxHighlighter>
              )
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
