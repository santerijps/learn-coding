/**
 * Finnish UI strings. To add a language, create a file with the same shape (`const en: Messages = …`)
 * and pick it in ./index.ts.
 */
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

export const fi = {
  locale: 'fi',
  appName: 'Koodikoulu',
  tagline: 'Opi uusi kieli tai työkalu nopeasti: kirjoita koodia, toista ja muista.',

  // Navigation
  back: 'Takaisin',
  home: 'Etusivu',
  lessons: 'Oppitunnit',
  cheatSheet: 'Lunttilappu',
  practice: 'Pikakierros',

  // Home and track pages
  lessonsDone: (done: number, total: number) => `${done}/${total} oppituntia suoritettu`,
  dueCount: (n: number) => `${n} ${plural(n, 'kortti', 'korttia')} kerrattavana`,
  newCount: (n: number) => `${n} ${plural(n, 'uusi kortti', 'uutta korttia')}`,
  streak: (n: number) => `${n} päivän putki`,
  startPractice: 'Aloita pikakierros',
  continueWith: (title: string) => `Jatka: ${title}`,
  openTrack: 'Avaa kurssi',
  allLessonsDone: 'Kaikki oppitunnit suoritettu!',
  lessonDone: 'Suoritettu',
  lessonNext: 'Seuraavaksi',
  exportAttempts: 'Lataa vastaushistoria (JSON)',
  exportHelp: 'Lähetä tiedosto opettajalle, niin hankalat tehtävät löytyvät ja niitä voidaan parantaa.',
  resetProgress: 'Nollaa edistyminen',
  resetConfirm: 'Haluatko varmasti poistaa kaiken edistymisen ja vastaushistorian? Tätä ei voi perua.',
  howItWorks: 'Näin se toimii',
  howItWorksSteps: [
    'Lue lyhyt oppitunti ja varmista ymmärrys muutamalla tehtävällä.',
    'Oppitunnin kortit siirtyvät pikakierrokselle: kirjoitat koodin ulkomuistista.',
    'Sovellus ajoittaa kertaukset juuri ennen kuin ehdit unohtaa. Muutama kierros päivässä riittää.',
  ],

  // Lesson page
  lessonNumber: (n: number) => `Oppitunti ${n}`,
  toExercises: 'Siirry tehtäviin',
  skipLesson: 'Osaan jo tämän, ohita',
  exerciseCounter: (i: number, n: number) => `Tehtävä ${i}/${n}`,
  exerciseKind: { choice: 'Monivalinta', blank: 'Täydennä', bug: 'Etsi virhe' } as const,
  bugInstruction: 'Valitse rivi, jolla virhe on.',
  blankInstruction: 'Täydennä puuttuvat kohdat.',
  blankLabel: (i: number) => `Aukko ${i}`,
  check: 'Tarkista',
  correct: 'Oikein!',
  tryAgain: 'Ei aivan. Yritä uudelleen.',
  revealed: 'Oikea vastaus on merkitty.',
  next: 'Seuraava',
  lessonComplete: 'Oppitunti suoritettu!',
  cardsUnlocked: (n: number) =>
    `${n} ${plural(n, 'uusi kortti siirtyi', 'uutta korttia siirtyi')} pikakierrokselle. Nyt kirjoitetaan koodia!`,
  nextLesson: (title: string) => `Seuraava oppitunti: ${title}`,

  // Practice
  cardCounter: (i: number, n: number) => `Kortti ${i}/${n}`,
  submitHintJs: (mod: string) => `${mod}+Enter tarkistaa · Enter vaihtaa riviä`,
  givenCode: 'Valmiina annettu koodi',
  submitHintShell: 'Enter tarkistaa',
  answerPlaceholderJs: 'Kirjoita koodi tähän…',
  answerPlaceholderShell: 'Kirjoita komento tähän…',
  answerLabel: 'Vastauksesi',
  hint: 'Vihje',
  giveUp: 'En muista',
  checking: 'Tarkistetaan…',
  wrongRetype: 'Ei aivan. Kirjoita mallivastaus kerran, niin se jää mieleen.',
  retypePlaceholder: 'Kirjoita mallivastaus…',
  retypeWrong: 'Ei vielä. Vertaa mallivastaukseen ja yritä uudelleen.',
  retypeDone: 'Hyvä! Tämä kortti tulee pian uudelleen.',
  modelAnswer: 'Mallivastaus',
  diffLegend: 'Punaisella: väärin tai ylimääräistä vastauksessasi. Vihreällä: puuttui vastauksestasi.',
  overrideRight: 'Vastaukseni oli oikein',
  errorPrefix: 'Virhe',
  timeout: 'Koodin suoritus kesti liian kauan (ikuinen silmukka?)',
  continue: 'Jatka',
  newCard: 'Uusi',
  noLessonsDone: 'Suorita ensin oppitunti, niin sen kortit tulevat kerrattaviksi.',
  firstLesson: (title: string) => `Aloita oppitunnista: ${title}`,
  nextReviewAt: (when: string) => `Seuraava kertaus ${when}.`,
  roundDone: 'Kierros valmis!',
  firstTry: (a: number, b: number) => `${a}/${b} oikein ensimmäisellä yrityksellä`,
  roundTime: (time: string) => `Aika ${time}`,
  newRound: 'Uusi kierros',
  backToTrack: 'Takaisin kurssille',

  // Lesson practice, stats and weak cards
  practiceLesson: 'Harjoittele tätä oppituntia',
  practiceAllLessons: 'Pikakierros kaikista oppitunneista',
  stats: 'Tilastot',
  statsPracticed: 'Harjoiteltuja kortteja',
  statsLearned: 'Opittuja kortteja',
  statsAnswers: 'Vastauksia',
  statsAccuracy: 'Oikein',
  statsStreak: 'Päivän putki',
  weakCards: 'Heikoimmat kortit',
  weakIntro: 'Kortit, joissa olet erehtynyt useimmin. Harjoittele niitä erikseen, niin ne jäävät mieleen.',
  weakNone: 'Ei heikkoja kortteja. Kaikki vastaukset ovat menneet oikein!',
  weakNothingYet: 'Harjoittele ensin muutama pikakierros, niin heikoimmat kortit löytyvät.',
  missedOf: (misses: number, attempts: number) => `${misses}/${attempts} väärin`,
  practiceWeak: 'Harjoittele heikoimpia',
  weakRound: 'Heikoimmat kortit',

  // Timed challenge
  challenge: 'Aikahaaste',
  challengeIntro: (seconds: number) =>
    `Kirjoita ${seconds} sekunnissa niin monta oikeaa vastausta kuin ehdit. Kortit tulevat suorittamistasi oppitunneista satunnaisessa järjestyksessä. Haaste ei vaikuta kertausaikatauluun.`,
  challengeBest: 'Aikahaasteen ennätys',
  challengeStart: 'Aloita',
  challengeAgain: 'Uusi yritys',
  challengeScore: (n: number) => `${n} oikein`,
  challengeNewBest: 'Uusi ennätys!',
  challengeBestWas: (n: number) => `Ennätyksesi: ${n}`,
  challengeTimeLeft: (s: number) => `${s} s`,
  challengeMissed: 'Nämä menivät väärin',
  challengeSkip: 'Ohita',
  challengeWrong: 'Väärin. Vertaa mallivastaukseen ja jatka.',

  // Cheat sheet
  cheatSheetIntro: 'Kaikki kurssin "Miten teen…?" -kortit mallivastauksineen.',
  search: 'Hae',
  searchPlaceholder: 'Hae, esim. "taulukko" tai "push"',
  noResults: 'Ei osumia.',

  notFound: 'Sivua ei löytynyt.',

  // Theme
  themeName: { auto: 'Automaattinen', light: 'Vaalea', dark: 'Tumma' } as const,
  themeSwitch: (current: string, next: string) => `Teema: ${current}. Vaihda teemaan ${next}.`,
}

export type Messages = typeof fi
