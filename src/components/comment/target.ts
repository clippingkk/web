/** What a discussion is about: one highlight, or a whole book. */
export type CommentTarget =
  | { kind: 'clipping'; clippingId: number }
  | { kind: 'book'; doubanId: string }

/** Comments shorter than this are refused (book comments on the server too). */
export const COMMENT_MIN_LENGTH = 40
/** The server refuses longer book comments; see src/server/book-comments. */
export const BOOK_COMMENT_MAX_LENGTH = 5000
