import init from '/shared/nbba-login.js'
import { loadLeagueExcel, loadTeamsFromExcel, loadRoundsFromExcel } from '../shared/excelUtils.js'
import { createA, createButton, removeChildren, createOption } from '../shared/nodeUtils.js'
import { getUrlParams } from '../shared/urlParamsUtils.js'
import { getDomNodesByIds, hide, show } from '../shared/domUtils.js'

// state
let isLoggedIn;
let sheet;

// nodes
const dom = getDomNodesByIds([
  'moreLeagueInfo',
  'formSubmit',
  'form',
  // 'team1',
  // 'team2',
  'form1Checkbox',
  'loadingLeague',

  'leagueMatchRound',
  'rounds',
  'leagueMatchTeams',
  'leagueTeams',
])

function loggedInCallback(newVal) {
  isLoggedIn = newVal
  if (isLoggedIn) {
    loadTeamsFromExcel()
    loadRoundsFromExcel()
      .then(setRounds)
      .then(setRoundGames)
    loadLeagueExcel()
      .then((loadedSheet) => { sheet = loadedSheet })
      .then(setMoreLeagueInfo)
      // .then(setTeams)
      .then(enableCheckbox)
  }
}

function setMoreLeagueInfo() {
  hide(dom.get('loadingLeague'))
  show(dom.get('form'))
  dom.get('moreLeagueInfo').appendChild(createA(sheet[2][1], sheet[1][1]))
}

function setTeams() {
  removeChildren(dom.get('team1'))
  removeChildren(dom.get('team2'))
  dom.get('team1').appendChild(createOption('N/A', 0))
  dom.get('team2').appendChild(createOption('N/A', 0))
  sheet.forEach((row, rowIndex) => {
    if (rowIndex >= 1 && row[3]) {
      dom.get('team1').appendChild(createOption(row[3], rowIndex))
      dom.get('team2').appendChild(createOption(row[3], rowIndex))
    }
  })
}

function enableCheckbox() {
  dom.get('form1Checkbox').removeAttribute('disabled')
}

function setRounds(rounds) {
  removeChildren(dom.get('rounds'))
  rounds.forEach((round, roundIndex) => {
    dom.get('rounds').appendChild(createOption(`Jornada ${round.roundNumber}`, roundIndex))
  })
  return rounds
}

function setRoundGames(rounds) {
  removeChildren(dom.get('leagueTeams'))
  rounds.forEach((round, roundIndex) => {
    round.roundGames.forEach((roundGame, roundGameIndex) => {
      // TODO CAMBIAR POR NOMBRE DE EQUIPO A PARTIR DE LA CARGA DE EQUIPOS
      dom.get('leagueTeams').appendChild(createOption(`${roundGame.team1} vs. ${roundGame.team2}`, `${roundIndex}-${roundGameIndex}`))
    })
  })
}


// function initSetup() {
//   const params = getUrlParams()
//   if (params.league === 'true') {
//     document.querySelector('#friendlyMatchTeam1').setAttribute('hidden', true)
//     document.querySelector('#friendlyMatchTeam2').setAttribute('hidden', true)
//     document.querySelector('#leagueMatchTeams').removeAttribute('hidden')
//     document.querySelector('#leagueMatchRound').removeAttribute('hidden')
//   } else {

//   }
// }

// initSetup()

init(loggedInCallback)
