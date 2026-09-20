// Kana, CJK unified ideographs (incl. extension A) and compatibility ideographs.
const CJK = /[\u3040-\u30ff\u3400-\u9fff\uf900-\ufaff]/

// share-preview.tsx imports the stylesheets for these families: WenKai 400/700
// and Literata 400/400 italic/700. Other weights would be synthesized.
export const LATIN_STACK = '"Literata", "LXGW WenKai", serif'
export const CJK_STACK = '"LXGW WenKai", "Literata", serif'

export function isLatin(text: string) {
  return !CJK.test(text)
}

// Literata's latin subset also claims U+2000-206F, so leading with it would
// set Chinese quotes, ellipses and dashes as narrow Latin punctuation.
export function posterFontFamily(text: string) {
  return isLatin(text) ? LATIN_STACK : CJK_STACK
}
