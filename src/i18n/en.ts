import type { Messages } from './fi'

/** English UI strings. */
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

export const en: Messages = {
  locale: 'en',
  appName: 'Code School',
  tagline: 'Learn a new language or tool fast: type code, repeat, remember.',

  // Navigation
  back: 'Back',
  home: 'Home',
  lessons: 'Lessons',
  cheatSheet: 'Cheat sheet',
  practice: 'Rapid fire',

  // Home and track pages
  lessonsDone: (done, total) => `${done}/${total} lessons completed`,
  dueCount: (n) => `${n} ${plural(n, 'card', 'cards')} due`,
  newCount: (n) => `${n} new ${plural(n, 'card', 'cards')}`,
  streak: (n) => `${n}-day streak`,
  startPractice: 'Start a round',
  continueWith: (title) => `Continue: ${title}`,
  openTrack: 'Open course',
  allLessonsDone: 'All lessons completed!',
  lessonDone: 'Completed',
  lessonNext: 'Up next',
  exportAttempts: 'Download answer history (JSON)',
  exportHelp: 'Send the file to your teacher so tricky exercises can be found and improved.',
  resetProgress: 'Reset progress',
  resetConfirm: 'Do you really want to delete all progress and answer history? This cannot be undone.',
  howItWorks: 'How it works',
  howItWorksSteps: [
    'Read a short lesson and check your understanding with a few exercises.',
    "The lesson's cards move into rapid-fire rounds: you type the code from memory.",
    'The app schedules reviews just before you would forget. A few rounds a day is enough.',
  ],

  // Lesson page
  lessonNumber: (n) => `Lesson ${n}`,
  toExercises: 'Go to exercises',
  skipLesson: 'I know this already, skip',
  exerciseCounter: (i, n) => `Exercise ${i}/${n}`,
  exerciseKind: { choice: 'Multiple choice', blank: 'Fill in the blank', bug: 'Find the bug' },
  bugInstruction: 'Pick the line with the bug.',
  blankInstruction: 'Fill in the missing parts.',
  blankLabel: (i) => `Blank ${i}`,
  check: 'Check',
  correct: 'Correct!',
  tryAgain: 'Not quite. Try again.',
  revealed: 'The correct answer is marked.',
  next: 'Next',
  lessonComplete: 'Lesson completed!',
  cardsUnlocked: (n) => `${n} new ${plural(n, 'card', 'cards')} moved into rapid fire. Time to write code!`,
  nextLesson: (title) => `Next lesson: ${title}`,

  // Practice
  cardCounter: (i, n) => `Card ${i}/${n}`,
  submitHintCode: (mod) => `${mod}+Enter checks · Enter adds a line`,
  givenCode: 'Code you are given',
  submitHintShell: 'Enter checks',
  answerPlaceholderCode: 'Type your code here…',
  answerPlaceholderShell: 'Type the command here…',
  answerLabel: 'Your answer',
  hint: 'Hint',
  giveUp: "I don't remember",
  checking: 'Checking…',
  wrongRetype: 'Not quite. Type out the model answer once so it sticks.',
  retypePlaceholder: 'Type the model answer…',
  retypeWrong: 'Not yet. Compare with the model answer and try again.',
  retypeDone: 'Good! This card will come back soon.',
  modelAnswer: 'Model answer',
  sameAsModel: 'Same as the model answer.',
  modelAnswerAlt: 'Model answer (another way to write it)',
  diffLegend: 'Red: wrong or extra in your answer. Green: missing from your answer.',
  overrideRight: 'My answer was right',
  errorPrefix: 'Error',
  timeout: 'The code took too long to run (an infinite loop?)',
  pythonLoading: 'Loading Python… (first time only)',
  pythonLoadFailed: 'Loading the Python runtime failed. Check your connection and reload the page.',
  continue: 'Continue',
  newCard: 'New',
  noLessonsDone: "Complete a lesson first and its cards will show up here.",
  firstLesson: (title) => `Start with: ${title}`,
  nextReviewAt: (when) => `Next review ${when}.`,
  roundDone: 'Round done!',
  firstTry: (a, b) => `${a}/${b} right on the first try`,
  roundTime: (time) => `Time ${time}`,
  newRound: 'New round',
  backToTrack: 'Back to the course',

  // Lesson practice, stats and weak cards
  practiceLesson: 'Practice this lesson',
  practiceAllLessons: 'Round from all lessons',
  stats: 'Stats',
  statsPracticed: 'Cards practiced',
  statsLearned: 'Cards learned',
  statsAnswers: 'Answers',
  statsAccuracy: 'Correct',
  statsStreak: 'Day streak',
  weakCards: 'Weakest cards',
  weakIntro: 'The cards you get wrong most often. Practice them on their own so they stick.',
  weakNone: 'No weak cards. Every answer has been right!',
  weakNothingYet: 'Do a few rapid-fire rounds first and your weakest cards will show up here.',
  missedOf: (misses, attempts) => `${misses}/${attempts} wrong`,
  practiceWeak: 'Practice the weakest',
  weakRound: 'Weakest cards',

  // Timed challenge
  challenge: 'Timed challenge',
  challengeIntro: (seconds) =>
    `Type as many correct answers as you can in ${seconds} seconds. Cards come from lessons you've completed, in random order. The challenge doesn't affect your review schedule.`,
  challengeBest: 'Challenge best',
  challengeStart: 'Start',
  challengeAgain: 'Try again',
  challengeScore: (n) => `${n} correct`,
  challengeNewBest: 'New personal best!',
  challengeBestWas: (n) => `Your best: ${n}`,
  challengeTimeLeft: (s) => `${s} s`,
  challengeMissed: 'These went wrong',
  challengeSkip: 'Skip',
  challengeWrong: 'Wrong. Compare with the model answer and continue.',

  // Cheat sheet
  cheatSheetIntro: 'Every "How do I…?" card in the course with its model answer.',
  search: 'Search',
  searchPlaceholder: 'Search, e.g. "array" or "push"',
  noResults: 'No matches.',

  notFound: 'Page not found.',

  // Theme
  themeName: { auto: 'Automatic', light: 'Light', dark: 'Dark' },
  themeSwitch: (current, next) => `Theme: ${current}. Switch to ${next}.`,

  // Language
  languageLabel: 'Language',
}
