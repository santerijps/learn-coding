# Koodikoulu

Learn a new programming language or tool fast, by typing code from memory over and over.

Each lesson is a short piece of theory plus a few quick understanding checks (multiple choice, fill in the blank, find the bug). Finishing a lesson moves its **rapid-fire cards** into a spaced-repetition deck: the learner types the code from memory, misses are retyped from the model answer, and the FSRS algorithm schedules each card's next review just before it would be forgotten.

Current content (in Finnish): **JavaScript** (17 lessons, from `console.log` to modules) and **Git** (8 lessons, from `git init` to stash).

## Running it

Requires [Bun](https://bun.sh) 1.4 or newer.

```bash
bun install
bun run dev      # dev server with hot reload
bun run test     # type check + unit tests + content checks
bun run build    # static site into dist/
```

Pushing to `main` runs the tests and deploys `dist/` to GitHub Pages (`.github/workflows/deploy.yml`). The first time, enable it under **Settings → Pages → Source: GitHub Actions**.

## How it works

- **Static site, no backend.** Progress lives in the learner's browser (localStorage). Routes are hash-based (`#/lesson/...`) so GitHub Pages needs no server config.
- **Answer checking** (`src/check/`):
  - `match` cards compare against the model answer and listed variants after normalization (whitespace, quote style, optional semicolons; for shell, a pasted `$ ` prompt).
  - `test` cards run the learner's JavaScript in a throwaway Web Worker with a 2-second limit, then evaluate test expressions. Tests can read `__logs` (console output) and `__raw` (raw `console.log` arguments).
  - When the checker is too strict, the learner can press "my answer was right"; those cases are logged so the card can be fixed.
- **Grading is automatic** (`src/srs/scheduler.ts`): wrong is Again, a hint makes it Hard, fast recall of a known card is Easy, otherwise Good. Missed cards come back once at the end of the round.
- **Data for the teacher:** "Lataa vastaushistoria (JSON)" on the home page downloads every attempt (answer, correct, time, hint, override), so struggling cards can be spotted.

## Writing content

Lessons are YAML files in `src/content/<locale>/<track>/`, listed in order in `src/content/<locale>/index.ts`. The schema is in `src/content/schema.ts`. A lesson looks like:

```yaml
id: js-taulukot              # prefixed with the track id
title: Taulukot
summary: One line for the lesson list.
theory: |                    # markdown: paragraphs, ### headings, - lists, ``` code blocks
  ...
exercises:                   # understanding checks, in order
  - type: choice             # options + answer index
  - type: blank              # code with ___ per blank, blanks: [[accepted, ...], ...]
  - type: bug                # code + bugLine (1-based)
cards:                       # rapid-fire cards
  - id: js-array-push
    prompt: Lisää luku `4` taulukon `luvut` loppuun.
    check: test              # or: match (with optional accepted: [...])
    setup: |
      const luvut = [1, 2, 3];
    tests:
      - 'luvut.length === 4 && luvut[3] === 4'
    solution: |
      luvut.push(4);
```

`bun run test` checks every card: each model answer must pass its own tests, an empty answer must fail, and exercises must be well-formed. A wrong card fails the build instead of reaching learners.

Card ids are what learners' progress is stored under, so don't rename them once published.

## Other languages

UI strings are in `src/i18n/fi.ts`. To add a language, add a file with the same shape (`Messages` type) and a matching `src/content/<locale>/` folder that uses the same lesson and card ids.
