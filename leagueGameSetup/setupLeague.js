import { initLogin } from '/components/nbba-login/nbba-login.js'
import { loadLeaguesExcel, loadLeagueExcel, loadTeamsFromExcel, loadRoundsFromExcel, getTurnsBasedOnBBRules } from '../shared/excelUtils.js'
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
  'leagueSelect',
  'leagueSelectContainer',
  'noLeagues'
])

function loggedInCallback(newVal) {
  isLoggedIn = newVal
  if (isLoggedIn) {
    const leaguesInfoPromise = loadLeaguesExcel().then(setLeagues)
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
  setTurns(leagueInfo.leagueRuleset)
  removeChildren(dom.get('moreLeagueInfo'))
  dom.get('moreLeagueInfo').appendChild(createA(leagueInfo.leagueName, leagueInfo.leagueLink))
}

function setRoundGames() {
  removeChildren(dom.get('matchSelect'))
  selectedRound.roundGames.forEach((roundGame) => {
    const team1Name = leagueTeams.find(a => a.teamId == roundGame.team1)?.teamName
    const team2Name = leagueTeams.find(a => a.teamId == roundGame.team2)?.teamName
    dom.get('matchSelect').appendChild(createOption(`${team1Name} – ${team2Name}`, roundGame.gameId))
  })
}

function setTurns(ruleset) {
  dom.get('turns').value = getTurnsBasedOnBBRules(ruleset)
}

function setLeagues(leagues) {
  removeChildren(dom.get('leagueSelect'))
  const activeLeagues = leagues.filter(league => league.isCompleted === 'No')
  if (activeLeagues.length > 0) {
    activeLeagues.forEach((league) => {
      dom.get('leagueSelect').appendChild(createOption(league.leagueName, league.leagueSheetId))
    })
  }

  hide(dom.get('loadingLeague'))

  if (activeLeagues.length > 0) {
    if (activeLeagues.length > 1) {
      show(dom.get('leagueSelectContainer'))
    }
    show(dom.get('form'))
    setLeague(leagues[0].leagueSheetId)
  } else {
    show(dom.get('noLeagues'))
  }
}

function setLeague(sheetId) {
  const loadTeamsPromise = loadTeamsFromExcel(sheetId).then(setTeams)
  const loadRoundsPromise = loadRoundsFromExcel(sheetId).then(setRounds)
  loadLeagueExcel(sheetId)
    .then(setLeagueInfo)

  Promise.all([loadTeamsPromise, loadRoundsPromise]).then(setRoundGames)
}

(function initListeners() {
  dom.get('roundSelect').addEventListener('change', (e) => {
    selectedRound = leagueRounds[dom.get('roundSelect').value]
    setRoundGames()
  })

  dom.get('leagueSelect').addEventListener('change', (e) => {
    setLeague(dom.get('leagueSelect').value)
  })
})()

initLogin(loggedInCallback)