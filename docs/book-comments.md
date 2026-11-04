# Book comments

Readers can comment on a whole book, not only on one highlight. A book has **one discussion**,
keyed by its Douban id: every reader's page for the book (`/dash/{user}/book/{doubanId}`) shows the
same comments, on the web and in the iOS app.

## Data

`book_comments` (`src/server/db/schema.ts`, migration `drizzle/0008_book_comments.sql`):

| Column       | Meaning                                                 |
| ------------ | ------------------------------------------------------- |
| `book_id`    | The Douban id, the same value as `clippings.book_id`    |
| `created_by` | The author's local user id                              |
| `content`    | Markdown, stored trimmed                                |
| `deleted_at` | Set by a delete; deleted rows are never listed          |

Highlight comments stay in `comments`, whose `belongs_to` is a clipping id. The two never mix, so
`Comment.belongsTo` remains a non-null `Clipping` for the clients that decode it.

## API

GraphQL (`src/schema/schema.json`), implemented in `src/server/book-comments/` and wired in
`src/server/graphql/resolvers.ts`:

```graphql
type BookComment {
  id: Int!
  doubanId: String!
  content: String!
  creator: User!
  creatorClippingsCount: Int!
  createdAt: String!
  updatedAt: String!
}

bookComments(doubanId: String!, pagination: Pagination): BookCommentListResponse!
createBookComment(doubanId: String!, content: String!): BookComment!
deleteBookComment(id: Int!): Boolean!
```

`bookComments` is a top-level query rather than a field on `Book`: `Book` is one reader's shelf and
fails with 404 when that shelf has no visible highlights, which would fail the whole response.

## Rules

| Rule        | Behaviour                                                                                          | Error                  |
| ----------- | -------------------------------------------------------------------------------------------------- | ---------------------- |
| Reading     | Open to everyone. Newest first, paged by `pagination.lastId` (limit 1–100, default 20).            | none                   |
| Signed in   | Required to post or delete.                                                                        | 401 `UNAUTHORIZED`     |
| Valid book  | A Douban id (`[1-9]\d{0,19}`) with at least one active highlight the poster can see (`clippingVisibleTo`), so posting never confirms a book that exists only in someone else's private library. A malformed id lists as empty. | 404 `NOT_FOUND`        |
| Length      | 40–5,000 characters after trimming. The clients check this too.                                    | 400 `BAD_REQUEST`      |
| Rate        | 20 comments per reader per hour (Redis `ck:book-comment:{uid}`), counted only after the checks above pass. | 429                    |
| Delete      | The author or an administrator (`ROOT_USERS`, `canAdmin`). Soft delete.                            | 403 `FORBIDDEN`        |
| Listing     | Leaves out deleted comments and comments by deleted accounts.                                      | none                   |
| Badge       | `creatorClippingsCount` counts the author's active highlights in the book that the **viewer** may see, so a private library never shows through. One grouped query per page. | none                   |

Deleting an account removes the reader's book comments (`src/server/gate/deletion.ts`).

## Web

- The book page (`src/app/dash/[userid]/book/[bookid]/`) has two tabs, Highlights and Discussion.
  The open tab lives in `?tab=discussion` (`book-tab.ts`), switched with `history.replaceState` so
  there is no server round trip. The "N comments" link in the header opens the tab.
- The discussion reuses the highlight comment components (`src/components/comment/`) with a
  `CommentTarget` of `{ kind: 'book', doubanId }`: the composer adds a public note and the 5,000
  limit, and each comment shows the author's highlight badge, linking to their shelf for the book.
- Premium readers keep "Improve with AI", called with the book's title and no clipping.

## iOS

The app reads the same API: the book screen has a Highlights / Discussion picker, and
`/dash/{user}/book/{doubanId}?tab=discussion` opens it on Discussion. See the iOS repo's CLAUDE.md.
