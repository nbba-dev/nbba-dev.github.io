import { initLogin } from '/components/nbba-login/nbba-login.js'
import { loadLeagueExcel, loadTeamsFromExcel, loadRoundsFromExcel } from '../shared/excelUtils.js'
import { createA, createButton, removeChildren, createOption } from '../shared/nodeUtils.js'
import { getUrlParams } from '../shared/urlParamsUtils.js'
import { getDomNodesByIds, hide, show } from '../shared/domUtils.js'

// state
let isLoggedIn;
let selectedRound;
let leagueRounds;
let leagueTeams;

// nodes
const dom = getDomNodesByIds([
  'moreLeagueInfo',
  'form',
  'loadingLeague',
  'roundSelect',
  'matchSelect',
  'turns',
])

function loggedInCallback(newVal) {
  isLoggedIn = newVal
  if (isLoggedIn) {
    const loadTeamsPromise = loadTeamsFromExcel().then(setTeams)
    const loadRoundsPromise = loadRoundsFromExcel().then(setRounds)
    loadLeagueExcel()
      .then(setLeagueInfo)

    Promise.all([loadTeamsPromise, loadRoundsPromise]).then(setRoundGames)
  }
}

function setTeams(teams) {
  leagueTeams = teams
}

function setRounds(rounds) {
  leagueRounds = rounds
  removeChildren(dom.get('roundSelect'))
  rounds.forEach((round, roundIndex) => {
    dom.get('roundSelect').appendChild(createOption(`Jornada ${round.roundNumber} – ${round.roundDates}`, roundIndex))
  })
  selectedRound = rounds[0]
  return rounds
}

function setLeagueInfo(leagueInfo) {
  hide(dom.get('loadingLeague'))
  show(dom.get('form'))
  setTurns(leagueInfo.leagueRuleset)
  dom.get('moreLeagueInfo').appendChild(createA(leagueInfo.leagueName, leagueInfo.leagueLink))
}

function setRoundGames() {
  removeChildren(dom.get('matchSelect'))
  selectedRound.roundGames.forEach((roundGame) => {
    const team1Name = leagueTeams.find(a => a.teamId == roundGame.team1)?.teamName
    const team2Name = leagueTeams.find(a => a.teamId == roundGame.team2)?.teamName
    console.log(roundGame.gameId)
    dom.get('matchSelect').appendChild(createOption(`${team1Name} – ${team2Name}`, roundGame.gameId))
  })
}

function setTurns(ruleset) {
  const turnsPerRuleset = {
    'BB7': 6,
    'BB11': 8
  }
  dom.get('turns').value = turnsPerRuleset[ruleset]
}

(function initListeners() {
  dom.get('roundSelect').addEventListener('change', (e) => {
    selectedRound = leagueRounds[dom.get('roundSelect').value]
    setRoundGames()
  })
})()

initLogin(loggedInCallback)