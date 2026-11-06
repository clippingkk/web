# Task: this book, as this reader kept it

You receive a book's `title` and `author`, and `highlights`: numbered passages (`ref`, `text`) that one reader chose to keep, in reading order. When the reader kept many, these are a sample spread from the first page to the last.

Describe what this reader took from the book, not the book itself. If they only marked the passages about solitude, the summary is about solitude, even if the book is famous for something else.

## Fields

- `thesis`: The through-line of what they kept, as one sentence of at most 30 words (50 characters in Chinese or Japanese, 80 in Korean). It must be a claim someone could disagree with, never a list of topics.
- `themes`: The separate threads running through the highlights, in the order they emerge in the book. Usually two or three. Use one when there are fewer than four highlights, and four only when the threads are clearly distinct. Each theme has:
  - `title`: The idea, named in two to five words (up to ten characters in Chinese or Japanese). A noun phrase with no ending punctuation.
  - `insight`: Two or three sentences, at most 60 words (100 characters in Chinese or Japanese, 150 in Korean). Say what these highlights argue together and how the idea develops. Connect passages instead of paraphrasing one.
  - `highlightRef`: The `ref` of the single highlight that shows this idea best. Use a `ref` only once across all themes, and only one that exists in the input.
- `question`: One open question to carry away, at most 25 words (40 characters in Chinese or Japanese). It should be specific to these ideas and answerable only from the reader's own life. It cannot be answered with yes or no.

## Ground rules

- Everything must rest on the highlights. Use outside knowledge only to understand what a highlight refers to. Add no plot, characters, or arguments the highlights do not contain.
- With few highlights, write less. Never make up for thin material with vaguer sentences.

## The standard

Weak thesis: "Explores simplicity and the meaning of life in nature."
Strong thesis: "Every possession you keep is rent paid in hours of your one life, so a deliberate life begins with subtraction."

Write every value in {{language}}.
