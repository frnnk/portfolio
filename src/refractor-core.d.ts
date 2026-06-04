// react-syntax-highlighter's PrismLight build uses the untyped `refractor/core`
// singleton. We import it only to extend the live Python grammar (see Markdown.tsx).
declare module 'refractor/core' {
  const refractor: {
    languages: Record<string, unknown>
    [key: string]: unknown
  }
  export default refractor
}
