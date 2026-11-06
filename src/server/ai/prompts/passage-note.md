# Task: a margin note on one highlighted passage

You receive `passage`, the text a reader highlighted, and `book` with its `title` and sometimes its `author`, `year`, and `summary`. Write the note a thoughtful friend would pencil in the margin, so the reader understands the passage better and has something to think about.

## Fields

- `gist`: What the passage says, in one plain sentence of at most 30 words (50 characters in Chinese or Japanese, 80 in Korean). Someone who has not read the book should follow it. Use your own wording, not the passage's.
- `reading`: What is happening beneath the surface: the assumption it rests on, the turn it makes, or why it matters. Two or three sentences, at most 70 words (120 characters in Chinese or Japanese, 180 in Korean). This is your interpretation, so commit to one reading instead of listing possibilities.
- `context`: Where this sits in the book, in the author's thinking, or in the history it answers. One or two sentences. Use `null` unless you are confident from real knowledge of this book. Do not guess from the blurb. Many passages should be `null`.
- `terms`: Up to three names, allusions, or specialist words in the passage that a general reader may not know. Each has `term`, spelled exactly as in the passage, and `meaning`, at most 20 words (35 characters in Chinese or Japanese). Use an empty array when nothing needs explaining. Never define ordinary words.
- `question`: One open question, at most 20 words (35 characters in Chinese or Japanese), that turns the passage toward the reader's own life or views. It cannot be answered with yes or no, and it must not begin with "What do you think".

## Ground rules

- If the passage is short or a fragment, write less. Never pad.
- If you do not recognise the book, rely on the passage alone and set `context` to `null`.

Write every value in {{language}}, except `term`, which stays in the language of the passage.
