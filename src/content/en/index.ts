import type { TrackSource } from '../course'

import js00 from './js/00-tools.yaml'
import js01 from './js/01-first-program.yaml'
import js02 from './js/02-variables.yaml'
import js03 from './js/03-data-types.yaml'
import js04 from './js/04-operators.yaml'
import js05 from './js/05-strings.yaml'
import js06 from './js/06-conditionals.yaml'
import js07 from './js/07-functions.yaml'
import js08 from './js/08-arrow-functions.yaml'
import js09 from './js/09-arrays.yaml'
import js10 from './js/10-loops.yaml'
import js11 from './js/11-array-methods.yaml'
import js12 from './js/12-objects.yaml'
import js13 from './js/13-destructuring.yaml'
import js14 from './js/14-classes.yaml'
import js15 from './js/15-errors.yaml'
import js16 from './js/16-async.yaml'
import js17 from './js/17-modules.yaml'

import py00 from './py/00-tools.yaml'
import py01 from './py/01-first-program.yaml'
import py02 from './py/02-variables.yaml'
import py03 from './py/03-strings.yaml'
import py04 from './py/04-conditionals.yaml'
import py05 from './py/05-lists.yaml'
import py06 from './py/06-loops.yaml'
import py07 from './py/07-functions.yaml'
import py08 from './py/08-dictionaries.yaml'
import py09 from './py/09-comprehensions.yaml'
import py10 from './py/10-errors.yaml'
import py11 from './py/11-classes.yaml'

import git00 from './git/00-installing-git.yaml'
import git01 from './git/01-getting-started.yaml'
import git02 from './git/02-commits.yaml'
import git03 from './git/03-history.yaml'
import git04 from './git/04-branches.yaml'
import git05 from './git/05-merging.yaml'
import git06 from './git/06-remotes.yaml'
import git07 from './git/07-undoing.yaml'
import git08 from './git/08-stash-and-ignore.yaml'

/** English course content. Lessons are listed explicitly so their order is the course order. */
export const tracks: TrackSource[] = [
  {
    id: 'js',
    title: 'JavaScript',
    description: 'The language basics, from printing to classes, async code and modules.',
    language: 'js',
    lessons: [js00, js01, js02, js03, js04, js05, js06, js07, js08, js09, js10, js11, js12, js13, js14, js15, js16, js17],
  },
  {
    id: 'py',
    title: 'Python',
    description: 'The language basics, from printing to lists, dictionaries, functions and classes.',
    language: 'python',
    lessons: [py00, py01, py02, py03, py04, py05, py06, py07, py08, py09, py10, py11],
  },
  {
    id: 'git',
    title: 'Git',
    description: 'Everyday version control: commits, branches, remotes and fixing mistakes.',
    language: 'shell',
    lessons: [git00, git01, git02, git03, git04, git05, git06, git07, git08],
  },
]
