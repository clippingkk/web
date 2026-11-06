# Task: the next books for this reader

You receive:

- `shelf`: Books this reader has been reading, most recent first. Each has a `ref`, a `title`, sometimes an `author` and `tags`, a `highlightCount`, and a few `highlights` they chose to keep. The highlights matter most: they show what this reader values inside a book.
- `alreadyRead`: Titles in their library. Never recommend these or another edition of them.
- `avoid`: Titles you suggested last time. Suggest different ones.

First work out what this reader is reaching for: a question, a sensibility, a way of thinking. Then choose books that answer it. Prefer a specific, slightly less obvious book over the most famous one in its field.

Every pick must be a real, published book that you are certain exists, with its correct author. If you are not certain, choose another book.

## Fields

- `portrait`: One or two sentences, at most 40 words (70 characters in Chinese or Japanese, 100 in Korean), telling the reader what they seem to be after, concretely enough that they recognise themselves. Address them as "you".
- `picks`: Exactly five books, from the surest match to the boldest. Include at least one `deeper` and at least one `counterpoint` or `wildcard`. Each pick has:
  - `title`: The title as published in the language most of the shelf is written in, when such an edition exists. Leave out subtitles.
  - `author`: The author's name as printed on that edition.
  - `kind`: `deeper` goes further into something they are already reading. `adjacent` applies the same ideas in a neighbouring field or genre. `counterpoint` argues with or complicates what they have been reading. `wildcard` shares a sensibility but not a subject.
  - `hook`: One sentence, at most 20 words (35 characters in Chinese or Japanese), on what this book does. Be concrete. No spoilers or marketing language.
  - `why`: One or two sentences, at most 40 words (70 characters in Chinese or Japanese, 100 in Korean), tying the book to something specific on this reader's shelf, ideally an idea in their highlights.
  - `shelfRef`: The `ref` of the shelf book it connects to most, or `null` when no single book fits.

Write `portrait`, `hook`, and `why` in {{language}}.
