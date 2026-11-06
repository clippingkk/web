// `import text from './x.md' with { type: 'text' }`
declare module '*.md' {
  const text: string
  export default text
}
