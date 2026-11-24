# Koodikoulu / Code School

Learn a new programming language or tool fast, by typing code from memory over and over.

Each lesson is a short piece of theory plus a few quick understanding checks (multiple choice, fill in the blank, find the bug). Finishing a lesson moves its **rapid-fire cards** into a spaced-repetition deck: the learner types the code from memory, misses are retyped from the model answer, and the FSRS algorithm schedules each card's next review just before it would be forgotten.

Content, in **Finnish and English**:

- **JavaScript**: 17 lessons, from `console.log` to modules
- **Python**: 11 lessons, from `print` to classes
- **Git**: 8 lessons, from `git init` to stash

Every lesson has at least 10 cards. In the JavaScript and Python lessons, the last few cards combine the new topic with earlier ones (a function lesson ends with functions that use variables, conditions and strings; a classes lesson with classes that hold lists and loop over them). The UI language defaults to the browser's (Finnish for Finnish browsers, English otherwise) and can be switched from the top bar at any time.

## Running it

Requires [Bun](https://bun.sh) 1.4 or newer, and `python3` for the content tests.

```bash
bun install
bun run dev      # dev server with hot reload (also serves the Python runtime)
bun run test     # type check + unit tests + content checks
bun run build    # static site into dist/
```

Pushing to `main` runs the tests and deploys `dist/` to GitHub Pages (`.github/workflows/deploy.yml`). The first time, enable it under **Settings → Pages → Source: GitHub Actions**.

## How it works

- **Static site, no backend.** Progress lives in the learner's browser (localStorage). Routes are hash-based (`#/lesson/...`) so GitHub Pages needs no server config.
- **Answer checking** (`src/check/`):
  - `match` cards compare against the model answer and listed variants after normalization (whitespace, quote style, optional semicolons; for shell, a pasted `$ ` prompt).
  - JavaScript `test` cards run the learner's code in a throwaway Web Worker with a 2-second limit, then evaluate test expressions. Tests can read `__logs` (console output) and `__raw` (raw `console.log` arguments).
  - Python `test` cards run in [Pyodide](https://pyodide.org) (CPython in WebAssembly) in a Web Worker. The runtime (~14 MB) is copied from the `pyodide` npm package into `dist/pyodide/`, served from the same site and only downloaded when someone practices Python. Tests are Python expressions and can read `__logs` (printed lines) and call `__raises(f, ErrorType, message)`.
  - When the checker is too strict, the learner can press "my answer was right"; those cases are logged so the card can be fixed.
- **Grading is automatic** (`src/srs/scheduler.ts`): wrong is Again, a hint makes it Hard, fast recall of a known card is Easy, otherwise Good. Missed cards come back once at the end of the round, and the retype step highlights how the answer differs from the model answer (`src/ui/diff.ts`). After a correct answer, the learner's code is shown, with the model answer below it when it was written differently (formatting aside).
- **Rounds** are always 10 cards (`src/pages/PracticePage.tsx`): a track round (due → new → soonest upcoming), a single-lesson round, or the learner's weakest cards from the stats page (`src/session/weak.ts`).
- **Timed challenge** (`src/pages/ChallengePage.tsx`): as many correct answers as possible in 60 seconds, with a personal best per track. It's logged for the stats but doesn't change review scheduling.
- **Data for the teacher:** the "download answer history (JSON)" button on the home page exports every attempt (answer, correct, time, hint, override), so struggling cards can be spotted.

## Writing content

Lessons are YAML files in `src/content/<locale>/<track>/`, listed in order in `src/content/<locale>/index.ts`. The schema is in `src/content/schema.ts`. A lesson looks like:

```yaml
id: js-taulukot              # prefixed with the track id; the same in every language
title: Arrays
summary: One line for the lesson list.
theory: |                    # markdown: paragraphs, ### headings, - lists, ``` code blocks
  ...
exercises:                   # understanding checks, in order
  - type: choice             # options + answer index
  - type: blank              # code with ___ per blank, blanks: [[accepted, ...], ...]
  - type: bug                # code + bugLine (1-based)
cards:                       # rapid-fire cards (at least 10)
  - id: js-array-push
    prompt: Add the number `4` to the end of the array `numbers`.
    check: test              # or: match (with optional accepted: [...])
    setup: |
      const numbers = [1, 2, 3];
    tests:
      - 'numbers.length === 4 && numbers[3] === 4'
    solution: |
      numbers.push(4);
```

Put the cards that combine the lesson's topic with earlier lessons at the end of the list, and use only what earlier lessons have taught.

`bun run test` checks every card in every language: each model answer must pass its own tests (JavaScript in Bun, Python with `python3`), an empty answer must fail, exercises must be well-formed, and every language must have the same tracks, lessons and cards in the same order.

Card ids are what learners' progress is stored under, so don't rename them once published. Because ids are shared, progress carries over when a learner switches language.

## Languages

UI strings are in `src/i18n/<locale>.ts` (`fi.ts` defines the `Messages` shape) and content in `src/content/<locale>/`. To add a language, add both, register them in `src/i18n/index.ts` and `src/content/index.ts`, and keep the lesson and card ids the same as in the other languages.
