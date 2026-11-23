import type { TrackSource } from '../course'

import js01 from './js/01-ensimmainen-ohjelma.yaml'
import js02 from './js/02-muuttujat.yaml'
import js03 from './js/03-tietotyypit.yaml'
import js04 from './js/04-operaattorit.yaml'
import js05 from './js/05-merkkijonot.yaml'
import js06 from './js/06-ehtolauseet.yaml'
import js07 from './js/07-funktiot.yaml'
import js08 from './js/08-nuolifunktiot.yaml'
import js09 from './js/09-taulukot.yaml'
import js10 from './js/10-silmukat.yaml'
import js11 from './js/11-taulukkometodit.yaml'
import js12 from './js/12-oliot.yaml'
import js13 from './js/13-destrukturointi.yaml'
import js14 from './js/14-luokat.yaml'
import js15 from './js/15-virheet.yaml'
import js16 from './js/16-async.yaml'
import js17 from './js/17-moduulit.yaml'

import py01 from './py/01-ensimmainen-ohjelma.yaml'
import py02 from './py/02-muuttujat.yaml'
import py03 from './py/03-merkkijonot.yaml'
import py04 from './py/04-ehtolauseet.yaml'
import py05 from './py/05-listat.yaml'
import py06 from './py/06-silmukat.yaml'
import py07 from './py/07-funktiot.yaml'
import py08 from './py/08-sanakirjat.yaml'
import py09 from './py/09-listakoosteet.yaml'
import py10 from './py/10-virheet.yaml'
import py11 from './py/11-luokat.yaml'

import git01 from './git/01-aloitus.yaml'
import git02 from './git/02-commit.yaml'
import git03 from './git/03-historia.yaml'
import git04 from './git/04-haarat.yaml'
import git05 from './git/05-yhdistaminen.yaml'
import git06 from './git/06-etarepot.yaml'
import git07 from './git/07-kumoaminen.yaml'
import git08 from './git/08-stash-ignore.yaml'

/** Finnish course content. Lessons are listed explicitly so their order is the course order. */
export const tracks: TrackSource[] = [
  {
    id: 'js',
    title: 'JavaScript',
    description: 'Kielen perusteet tulostamisesta luokkiin, asynkronisuuteen ja moduuleihin.',
    language: 'js',
    lessons: [js01, js02, js03, js04, js05, js06, js07, js08, js09, js10, js11, js12, js13, js14, js15, js16, js17],
  },
  {
    id: 'py',
    title: 'Python',
    description: 'Kielen perusteet tulostamisesta listoihin, sanakirjoihin, funktioihin ja luokkiin.',
    language: 'python',
    lessons: [py01, py02, py03, py04, py05, py06, py07, py08, py09, py10, py11],
  },
  {
    id: 'git',
    title: 'Git',
    description: 'Versionhallinnan arki: commitit, haarat, etärepot ja virheiden korjaaminen.',
    language: 'shell',
    lessons: [git01, git02, git03, git04, git05, git06, git07, git08],
  },
]
