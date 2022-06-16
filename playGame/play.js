import { getDomNodesByIds, show, hide, getDomArr } from '/shared/domUtils.js'
import { getTeamName, getActiveTurn, getActiveHalf, isLeagueGame } from '/playGame/playUtils.js'
import { getTouchdownRecord, getInjuryRecords, getInjuryType, getPassRecord, getPassType, getWeatherRecord, getKickoffRecord, getNuffleRecord } from '/playGame/gameEventsUtils.js'
import { initPlayListeners } from '/playGame/playListeners.js';
import { initPlayModals } from '/playGame/playModals.js';
import { initLogin } from '/components/nbba-login/nbba-login.js'
import { loadLeagueExcel, loadTeamsFromExcel, loadRoundsFromExcel, getTurnsBasedOnBBRules, loadTeamPlayersFromExcel } from '/shared/excelUtils.js'
import { recordGame } from '/playGame/gameRecordUtils.js';
import { createImg, createButtonInnerHtml } from '/shared/nodeUtils.js';
import { setTeamsAsOptionsForSelect, setPlayersAsOptionsForSelect } from '/playGame/playNodeUtils.js';

// state
const dom = getDomNodesByIds([
  'team2TurnTurn',
  'team1TurnTurn',
  'half',
  'pauseTurnContainer',
  'team1Name',
  'team1Logo',
  'team2Name',
  'team2Logo',
  'team1TurnTime',
  'team2TurnTime',
  'team1Scoreboard',
  'team2Scoreboard',
  'team1Turn',
  'team2Turn',
  'delayContainer',
  'endgameTeam1',
  'endgameTeam2',
  'endgameOverlay',
  'weatherValue',
  'weather',
  'touchdownForm',
  'injuryForm',
  'injuryRollSelect',
  'gameRecordInsertionPoint',
  'gameRecordInsertionPointEndgame',
  'attackingInjuryPlayerInput',
  'attackingInjuryPlayerForm',
  'gameRecordsContainer',
  'gameRecordsContainerEndgame',
  'noGameRecordsEndgame',
  'touchdownHalf',
  'touchdownTurn',
  'injuryHalf',
  'injuryTurn',
  'eventButtons',
  'confirmTouchdownButton',
  'confirmInjuryButton',
  'eventBackButton',
  'passForm',
  'passHalf',
  'passTurn',
  'confirmPassButton',
  'kickoffBackBtn',
  'kickoffCompleted',
  'team1winnings',
  'team2winnings',
  'winningsFanFactorTeam1',
  'winningsFanFactorTeam2',
  'winningsFanFactorResultTeam1',
  'winningsFanFactorResultTeam2',
  'page2',
  'loadingModal',
  'surrenderConfirmButton',
  'surrenderTeamSelect',
  'winningsOnSurrender',
  'touchdownTeam',
  'injuryHurtTeam',
  'injuryHurtingTeam',
  'passTeam',
  'touchdownPlayer',
  'injuryHurtPlayer',
  'injuryHurtingPlayer',
  'passPlayer',
  'kickoffSelect',
  'nuffleSelect',
  'skipGuidedMode',
  'completedFameBtn',
  'completedFameBtnPls',
  'completedWeatherBtn',
  'completedWeatherBtnPls',
  'completedKickoffBtnPls',
  'completedNuffleBtn',
  'completedNuffleBtnPls',
  'skipNewFanFactor'
])

let gameConfig;
let gameState = {
  hasStarted: false,
  activeDelayTimeout: null,
  team1: {
    turn: 0,
    elapsedTime: 0,
    score: 0,
    name: 'Local',
    logo: '/multimedia/team0.png',
    fame: 1,
  },
  team2: {
    turn: 0,
    elapsedTime: 0,
    score: 0,
    name: 'Visitante',
    logo: '/multimedia/team0.png',
    fame: 1,
  },
  isTeam1turn: false,
  isSecondPart: false,
  endedGame: false,
  playedTimeoutForThisTurn: false,
  temporalTouchdown: null,
  temporalInjury: null,
  temporalPass: null,
  endedAndTeam1Wins: false,
  endedAndTeam2Wins: false,
  endedInTie: false,
}

let gameRecord = []
let gameSecondaryRecords = []
let clock;
let wakeLock = null;
let isInFullscreen = false;
let teams, rounds, league;
let isLoggedIn;
let playerSecuencialNumber;

window.gameRecord = gameRecord
window.gameSecondaryRecords = gameSecondaryRecords
window.gameState = gameState

const timeoutAudio = new Audio('/multimedia/Timeout.mp3');
const turnAudio = new Audio('/multimedia/Turn.mp3');
const turn2Audio = new Audio('/multimedia/Turn2.mp3');

initPlayListeners(gameState)
initPlayModals(gameState)

// functions

function loggedInCallback(newVal) {
  isLoggedIn = newVal
  if (isLoggedIn) {
    const loadTeamsPromise = loadTeamsFromExcel(gameConfig.leagueSheetId).then((response) => { teams = response })
    const loadRoundsPromise = loadRoundsFromExcel(gameConfig.leagueSheetId).then((response) => { rounds = response })
    const loadLeaguePromise = loadLeagueExcel(gameConfig.leagueSheetId).then((response) => { league = response })

    Promise.all([loadTeamsPromise, loadRoundsPromise, loadLeaguePromise]).then(() => {
      let currentGame
      const currentRound = rounds.find(a => currentGame = a.roundGames.find(b => b.gameId == gameConfig.gameId))

      const team1 = teams.find(a => a.teamId == currentGame.team1)
      const team2 = teams.find(a => a.teamId == currentGame.team2)

      gameState.team1.name = team1.teamName
      gameState.team1.id = team1.teamId
      gameState.team1.fanFactor = team1.teamFame
      gameState.team1.fame = team1.teamFame
      gameState.team1.logo = team1.teamLogo

      gameState.team2.name = team2.teamName
      gameState.team2.id = team2.teamId
      gameState.team2.fanFactor = team2.teamFame
      gameState.team2.fame = team2.teamFame
      gameState.team2.logo = team2.teamLogo

      gameState.currentGameId = currentGame.gameId
      gameState.currentRoundNumber = currentRound.roundNumber

      gameConfig.turns = getTurnsBasedOnBBRules(league.leagueRuleset)

      updateTeam1()
      updateTeam2()

      updateFameTeam1()
      updateFameTeam2()

      updateTeamDropdowns()

      if (team1.teamRoster) {
        const loadTeam1PlayersPromise = loadTeamPlayersFromExcel(team1.teamRoster).then((response) => {
          gameState.team1.players = response
          updateTeam1Players()
        })
      } else {
        setDefaultPlayers(gameState.team1)
        updateTeam1Players()
      }

      if (team2.teamRoster) {
          const loadTeam2PlayersPromise = loadTeamPlayersFromExcel(team2.teamRoster).then((response) => {
          gameState.team2.players = response
        })
      } else {
        setDefaultPlayers(gameState.team2)
      }

      hide(dom.get('loadingModal'))
    })
  }
}

function init() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  gameConfig = params;
  gameConfig.time = Number(params.time) + 1; // para que empiece en el minuto exacto
  gameConfig.delay = gameConfig.delay ?? 2;
  gameConfig.leagueSheetId = gameConfig.league;
  window.gameConfig = gameConfig

  if (params?.team1 === null || params?.team1 === undefined) {
    gameState.team1.name = params.team1Name
    gameState.team2.name = params.team2Name
  }

  if (!isLeagueGame()) {
    hide(dom.get('loadingModal'))
  } else {
    hide(dom.get('skipNewFanFactor'))
    hide(dom.get('skipGuidedMode'))
    hide(dom.get('completedFameBtn'))
    show(dom.get('completedFameBtnPls'))
    hide(dom.get('completedWeatherBtn'))
    show(dom.get('completedWeatherBtnPls'))
    hide(dom.get('kickoffCompleted'))
    show(dom.get('completedKickoffBtnPls'))
    hide(dom.get('completedNuffleBtn'))
    show(dom.get('completedNuffleBtnPls'))
  }

  showPage2()
  updateTeam1()
  updateTeam2()
  if (isGuidedGame()) {
    openFameModal(0)
  }
}

function isGuidedGame() {
  return gameConfig.guided === 'on'
}

function showPage2() {
  show(dom.get('page2'))
}

window.reset = function(){
  const alert = confirm("¿Seguro que quieres empezar un nuevo partido?");
  if (alert == true) {
    window.location.href = '/'
  }
}

window.goToHome = function(){
  const alert = confirm("¿Seguro que quieres salir?");
  if (alert == true) {
    window.location.href = '/'
  }
}

window.keepGoing = function() {
  if (gameState.hasStarted) {
    startClock()
  }
  closeTouchdown()
  closeInjury()
  closePass()
  closePauseModal()
}

function startTurn1() {
  turnAudio.play()
  const hasJustFinishedAHalf = gameState.team1.turn === Number(gameConfig.turns)
  gameState.isTeam1turn = true
  startTurn('team1', hasJustFinishedAHalf)
  dom.get('team1TurnTurn').innerHTML = gameState.team1.turn
  if (hasJustFinishedAHalf) {
    activateTeam2()
  } else {
    activateTeam1()
  }
}

function startTurn2() {
  turnAudio.play()
  const hasJustFinishedAHalf = gameState.team2.turn === Number(gameConfig.turns)
  gameState.isTeam1turn = false
  startTurn('team2', hasJustFinishedAHalf)
  dom.get('team2TurnTurn').innerHTML = gameState.team2.turn
  if (hasJustFinishedAHalf) {
    activateTeam1()
  } else {
    activateTeam2()
  }
}

function startTurn(newPlayer, hasJustFinishedAHalf) {
  gameState[newPlayer].turn += 1
  gameState.playedTimeoutForThisTurn = false

  if (hasJustFinishedAHalf) {
    finishedHalf(newPlayer)
    pauseClock()
  } else {
    resetClock()
    startClock()
  }
}

window.clickOnTurn1 = function() {
  const firstTurnInTheGame = !gameState.hasStarted && !gameState.isSecondPart
  const firstTurnInSecondHalf = !gameState.hasStarted && gameState.isSecondPart
  const isAlreadyHisTurn = gameState.isTeam1turn
  goFullscreen()

  if (firstTurnInTheGame) {
    gameState.hasStarted = true
    startTurn1()
  } else if (firstTurnInSecondHalf && !gameState.isTeam1turn) {
    gameState.hasStarted = true
    startTurn1()
  } else if (!firstTurnInSecondHalf && isAlreadyHisTurn) {
    startTurn2()
  }
}

window.clickOnTurn2 = function() {
  const firstTurnInTheGame = !gameState.hasStarted && !gameState.isSecondPart
  const firstTurnInSecondHalf = !gameState.hasStarted && gameState.isSecondPart
  const isAlreadyHisTurn = !gameState.isTeam1turn
  goFullscreen()

  if (firstTurnInTheGame) {
    gameState.hasStarted = true
    startTurn2()
  } else if (firstTurnInSecondHalf && gameState.isTeam1turn) {
    gameState.hasStarted = true
    startTurn2()
  } else if (!firstTurnInSecondHalf && isAlreadyHisTurn) {
    startTurn1()
  }
}

function finishedHalf(startingTeam) {
  gameState.team1.turn = 0
  gameState.team2.turn = 0
  dom.get('team1TurnTurn').innerHTML = gameState.team1.turn
  dom.get('team2TurnTurn').innerHTML = gameState.team2.turn

  if (!gameState.isSecondPart) {
    if (isGuidedGame()) {
      openKickoffModal()
    }
    if (startingTeam === 'team1') {
      dom.get('team2TurnTime').innerHTML = 'Comienza segunda parte'
    } else {
      dom.get('team1TurnTime').innerHTML = 'Comienza segunda parte'
    }
    dom.get('half').forEach(a => a.innerHTML = 'Segunda Parte')
    gameState.isSecondPart = true
  } else {
    dom.get('half').forEach(a => a.innerHTML = '¡Fin del partido!')
    finishGame()
  }

  gameState.hasStarted = false
}

function finishGame() {
  gameState.endedGame = true
  show(dom.get('endgameOverlay'))
  if (gameState.team1.score > gameState.team2.score) {
    gameState.endedAndTeam1Wins = true
    show(dom.get('endgameTeam1'))
  } else if (gameState.team1.score < gameState.team2.score) {
    gameState.endedAndTeam2Wins = true
    show(dom.get('endgameTeam2'))
  } else {
    gameState.endedInTie = true
    show(dom.get('endgameTeam1'))
    show(dom.get('endgameTeam2'))
  }
  startConfetti()
}

function updateTeam1() {
  const team = gameState.team1
  if (team.logo) {
    dom.get('team1Logo').forEach((a) => a.src = team.logo)
  }
  dom.get('team1Name').forEach((a) => a.innerHTML = team.name)
  // dom.get('team1ScoreName').innerHTML = team.name
  // dom.get('team1ScoreInput').value = '0'
}

function updateTeam2() {
  const team = gameState.team2
  if (team.logo) {
    dom.get('team2Logo').forEach((a) => a.src = team.logo)
  }
  dom.get('team2Name').forEach((a) => a.innerHTML = team.name)
  // dom.get('team2ScoreName').innerHTML = team.name
  // dom.get('team2ScoreInput').value = '0'
}

function updateTeamDropdowns() {
  setTeamsAsOptionsForSelect(dom.get('touchdownTeam'))
  setTeamsAsOptionsForSelect(dom.get('injuryHurtTeam'))
  setTeamsAsOptionsForSelect(dom.get('injuryHurtingTeam'))
  setTeamsAsOptionsForSelect(dom.get('passTeam'))
}

function updateTeam1Players() {
  const team = gameState.team1
  team.players && setPlayersAsOptionsForSelect(dom.get('touchdownPlayer'), team.players)
  team.players && setPlayersAsOptionsForSelect(dom.get('injuryHurtPlayer'), team.players)
  team.players && setPlayersAsOptionsForSelect(dom.get('injuryHurtingPlayer'), team.players)
  team.players && setPlayersAsOptionsForSelect(dom.get('passPlayer'), team.players)
}

function setDefaultPlayers(team) {
  // for BB sevens only
  const defaultPlayers = [1,2,3,4,5,6,7]
  const teamPlayers = []
  defaultPlayers.forEach((playerNumber) => {
    playerSecuencialNumber += 1
    teamPlayers.push({
      playerId: playerSecuencialNumber,
      playerNumber: playerNumber,
      playerName: `jugador (${playerNumber})`,
      playerPosition: '',
      playerValue: '-',
    })
  })
  team.players = teamPlayers
}

window.updateTouchdownPlayers = function(teamId) {
  const team = teamId == 1 ? gameState.team1 : gameState.team2
  setPlayersAsOptionsForSelect(dom.get('touchdownPlayer'), team.players)
}
window.updateInjuryHurtPlayers = function(teamId) {
  const team = teamId == 1 ? gameState.team1 : gameState.team2
  setPlayersAsOptionsForSelect(dom.get('injuryHurtPlayer'), team.players)
}
window.updateInjuryHurtingPlayers = function(teamId) {
  const team = teamId == 1 ? gameState.team1 : gameState.team2
  setPlayersAsOptionsForSelect(dom.get('injuryHurtingPlayer'), team.players)
}
window.updatePassPlayers = function(teamId) {
  const team = teamId == 1 ? gameState.team1 : gameState.team2
  setPlayersAsOptionsForSelect(dom.get('passPlayer'), team.players)
}

function applyClockLogic(timeDiff) {
  const remainingTime = Number(gameConfig.time * 1000) - Number(timeDiff)
  if (remainingTime < 0 || gameState.endedGame) {
    pauseClock()
    setTurnover()
    if (!gameState.playedTimeoutForThisTurn) {
      gameState.playedTimeoutForThisTurn = true
      navigator.vibrate(1000);
      timeoutAudio.play()
    }
  } else {
    addTimeToActivePlayer()
    const remainingTimeInString = `${getRawMinutes(remainingTime)}:${getRawSeconds(remainingTime)}`
    if (gameState.isTeam1turn) {
      dom.get('team1TurnTime').innerHTML = remainingTimeInString
    } else {
      dom.get('team2TurnTime').innerHTML = remainingTimeInString
    }
  }
}

function addTimeToActivePlayer() {
  if (gameState.isTeam1turn) {
    gameState.team1.elapsedTime += 1
  } else {
    gameState.team2.elapsedTime += 1
  }
}

function getTouchdownsFromRecords() {
  let team1TDs = 0
  let team2TDs = 0
  gameRecord.forEach((record) => {
    if (record.event === 'TD' && record.team === 1) {
      team1TDs += 1
    } else if (record.event === 'TD' && record.team === 2) {
      team2TDs += 1
    }
  })
  return [team1TDs, team2TDs]
}

function setTouchdowns(team1Score, team2Score) {
  const touchDowns = getTouchdownsFromRecords()
  const team1TD = team1Score ?? touchDowns[0]
  const team2TD = team2Score ?? touchDowns[1]
  gameState.team1.score = team1TD
  gameState.team2.score = team2TD
  dom.get('team1Scoreboard').forEach((a) => a.innerHTML = team1TD)
  dom.get('team2Scoreboard').forEach((a) => a.innerHTML = team2TD)
}

function activateTeam1() {
  dom.get('team1Turn').classList.remove('notActivePlayer')
  dom.get('team1Turn').classList.add('activePlayer')
  dom.get('team2Turn').classList.remove('activePlayer')
  dom.get('team2Turn').classList.add('notActivePlayer')
}

function activateTeam2() {
  dom.get('team2Turn').classList.remove('notActivePlayer')
  dom.get('team2Turn').classList.add('activePlayer')
  dom.get('team1Turn').classList.remove('activePlayer')
  dom.get('team1Turn').classList.add('notActivePlayer')
}

function setTurnover() {
  if (gameState.isTeam1turn) {
    dom.get('team1Turn').classList.add('turnover')
  } else {
    dom.get('team2Turn').classList.add('turnover')
  }
}

function resetTurnover() {
  dom.get('team1Turn').classList.remove('turnover')
  dom.get('team2Turn').classList.remove('turnover')
}

window.goFullscreen = function() {
  requestWakeLock()
  isInFullscreen = true
  document.body.requestFullscreen()
}

window.toggleFullscreen = function() {
  requestWakeLock()
  if (isInFullscreen) {
    isInFullscreen = false
    document.exitFullscreen();
  } else {
    isInFullscreen = true
    document.body.requestFullscreen()
    .then(function() {
      // element has entered fullscreen mode successfully
    })
    .catch(function(error) {
      // element could not enter fullscreen mode
    });
  }
}

window.goBackOneTurn = function () {
  if (gameState.isTeam1turn) {
    gameState.team1.turn = gameState.team1.turn === 0 ? 0 : gameState.team1.turn -= 1
    dom.get('team1TurnTurn').innerHTML = gameState.team1.turn
    activateTeam2()
    gameState.isTeam1turn = false
  } else {
    gameState.team2.turn = gameState.team2.turn === 0 ? 0 : gameState.team2.turn -= 1
    dom.get('team2TurnTurn').innerHTML = gameState.team2.turn
    activateTeam1()
    gameState.isTeam1turn = true
  }
  gameState.playedTimeoutForThisTurn = false
  closeSettingsModal()
  openPauseModal()
  resetClock()
}

// Function that attempts to request a wake lock.
async function requestWakeLock() {
  if (!wakeLock) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        wakeLock = null
      });
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  }
};

// clock

let startTime;
let repaintLoop;
let storedElapsedTime = 0;
let now;

function startClock() {
  resetTurnover()
  triggerDelay().then(() => {
    startTime = performance.now()
    repaintLoop = requestAnimationFrame(tickClock)
  })
}

function pauseClock() {
  storedElapsedTime = (now - startTime) + storedElapsedTime;
  cancelAnimationFrame(repaintLoop)
}

function tickClock() {
  now = performance.now()
  const timeDiff = (now - startTime) + storedElapsedTime || 0;
  repaintLoop = requestAnimationFrame(tickClock)
  applyClockLogic(timeDiff)
}

function resetClock() {
  startTime = null
  storedElapsedTime = null
  startTime = performance.now();
  cancelAnimationFrame(repaintLoop)
}

function getRawMinutes(duration) {
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const abs = Math.floor(duration / (1000 * 60))
  const under10 = `0${minutes}`;
  const over10 = `${minutes}`;
  if (abs === 0) {
    return '00'
  } else {
    return `${(minutes < 10) ? under10 : over10}`
  }
}
function getRawSeconds(duration) {
  const seconds = Math.floor((duration / 1000) % 60);
  const abs = Math.floor(duration / 1000)
  const under10 = `0${seconds}`;
  const over10 = `${seconds}`;
  if (abs === 0) {
    return '00'
  } else {
    return `${(seconds < 10) ? under10 : over10}`
  }
}

function triggerDelay() {
  return new Promise((resolve, reject) => {
    show(dom.get('delayContainer'))
    gameState.activeDelayTimeout = setTimeout(() => {
      gameState.activeDelayTimeout = null
      hide(dom.get('delayContainer'))
      turn2Audio.play()
      resolve()
    }, Number(gameConfig.delay) * 1000)
  })
}

// init

init();

window.completedFame = function() {
  closeFameModal()
  openWeatherModal()
}

window.completedWeatherStandalone = function() {
  const valueForWeather = Number(dom.get('weatherValue').value)
  const weatherDict = {
    1: '🔥',
    2: '☀️',
    4: '🌨',
    5: '❄️',
    // else: '🌤'
  }
  dom.get('weather').innerText = weatherDict[valueForWeather] || ''
  hide(dom.get('weather'))
  closeWeatherModal()
  registerWeatherRoll()
}

window.completedWeather = function() {
  completedWeatherStandalone()
  openInducementsModal()
}

window.kickoffChangeWeather = function() {
  closeKickoffModal()
  dom.get('completedWeatherBtn').onclick = completedWeatherStandalone
  kickoffModal.classList.remove('disableOverlay')
  openWeatherModal()
}

window.kickoffTimeout = function() {
  const kickingTeamTurn = gameState.isTeam1turn ? gameState.team1.turn : gameState.team2.turn
  if (kickingTeamTurn <= 3) {
    gameState.team1.turn += 1
    gameState.team2.turn += 1
  } else {
    gameState.team1.turn -= 1
    gameState.team2.turn -= 1
  }
  dom.get('team1TurnTurn').innerHTML = gameState.team1.turn
  dom.get('team2TurnTurn').innerHTML = gameState.team2.turn
  closeKickoffModal()
}

const registerKickoffRoll = function () {
  const valueForKickoff = dom.get('kickoffSelect').value
  dom.get('kickoffSelect').value = '0'
  if (valueForKickoff !== '0') {
    gameSecondaryRecords.push(getKickoffRecord(valueForKickoff, getActiveHalf(), getActiveTurn()))
  }
  updateSelectedKickoff(0)
}

const registerWeatherRoll = function () {
  const valueForWeather = Number(dom.get('weatherValue').value)
  dom.get('weatherValue').value = '0'
  if (valueForWeather !== '0') {
    gameSecondaryRecords.push(getWeatherRecord(valueForWeather, getActiveHalf(), getActiveTurn()))
  }
  updateSelectedWeather(0)
}

const registerNuffleRoll = function () {
  const valueForNuffle = dom.get('nuffleSelect').value
  dom.get('nuffleSelect').value = '0'
  if (valueForNuffle !== '0') {
    gameSecondaryRecords.push(getNuffleRecord(valueForNuffle, getActiveHalf(), getActiveTurn()))
  }
  updateSelectedNuffle(0)
}

window.completedKickoff = function() {
  registerKickoffRoll()
  closeKickoffModal()
}

window.completedKickoffStandalone = function() {
  registerKickoffRoll()
  closeKickoffModalStandalone()
  openPauseModal()
}

window.kickoffNuffle = function() {
  completedKickoff()
  openNuffleModal()
}

window.completedNuffle = function() {
  registerNuffleRoll()
  closeNuffleModal()
}

window.completedInducements = function() {
  closeInducementsModal()
  openPrePrayersToNuffleModal()
}

window.completedPrePrayersToNuffle = function() {
  closePrePrayersToNuffleModal()
  openKickoffModal()
}

window.goBackToFame = function() {
  closeWeatherModal()
  openFameModal(0)
}
window.goBackToWeather = function() {
  closeInducementsModal()
  openWeatherModal()
}
window.goBackToInducements = function() {
  closePrePrayersToNuffleModal()
  openInducementsModal()
}
window.goBackToNuffle = function() {
  closeKickoffModal()
  openPrePrayersToNuffleModal()
}

window.startAfterMatch = function() {
  stopConfetti()
  openOutcomeModal()
}
window.completedOutcome = function() {
  closeOutcomeModal()
  openWinningsModal()
}
window.completedWinnings = function() {
  closeWinningsModal()
  openFanFactorModal()
}
window.completedFanFactor = function() {
  closeFanFactorModal()
  if (isLeagueGame()) {
    recordGame(gameState, [...gameRecord, ...gameSecondaryRecords], league)
  }
  openSppModal()
}
window.completedSPP = function() {
  closeSppModal()
}

window.pauseGame = function() {
  pauseClock()
  clearTimeout(gameState.activeDelayTimeout)
  gameState.activeDelayTimeout = null
  openPauseModal()
}

function setActiveTouchdownTurnAndHalf() {
  const activeTurn = getActiveTurn() || 1
  dom.get('touchdownHalf').children[getActiveHalf() - 1].setAttribute('selected', true)
  dom.get('touchdownTurn').children[activeTurn - 1].setAttribute('selected', true)
}

function setActiveInjuryTurnAndHalf() {
  const activeTurn = getActiveTurn() || 1
  dom.get('injuryHalf').children[getActiveHalf() - 1].setAttribute('selected', true)
  dom.get('injuryTurn').children[activeTurn - 1].setAttribute('selected', true)
}

function setActivePassTurnAndHalf() {
  const activeTurn = getActiveTurn() || 1
  dom.get('passHalf').children[getActiveHalf() - 1].setAttribute('selected', true)
  dom.get('passTurn').children[activeTurn - 1].setAttribute('selected', true)
}

window.openTouchdown = function() {
  closeEventButtons()
  show(dom.get('touchdownForm'))
  show(dom.get('confirmTouchdownButton'))
  show(dom.get('eventBackButton'))
  closeInjury()
  closePass()
  setActiveTouchdownTurnAndHalf()
}

window.closeTouchdown = function() {
  hide(dom.get('confirmTouchdownButton'))
  hide(dom.get('touchdownForm'))
}

window.confirmTouchdown = function() {
  hide(dom.get('touchdownForm'))
  hide(dom.get('confirmTouchdownButton'))
  const tempTd = gameState.temporalTouchdown ?? getTouchdownRecord({});
  gameRecord.push(tempTd)
  gameState.temporalTouchdown = null
  closeEventModal()
  openPauseModal()
  setTouchdowns()
  setGameRecordsContent()
}

window.openInjury = function() {
  closeEventButtons()
  closeTouchdown()
  closePass()
  show(dom.get('injuryForm'))
  show(dom.get('confirmInjuryButton'))
  show(dom.get('eventBackButton'))
  setActiveInjuryTurnAndHalf()
}

window.closeInjury = function() {
  hide(dom.get('confirmInjuryButton'))
  hide(dom.get('injuryForm'))
}

window.confirmInjury = function() {
  hide(dom.get('injuryForm'))
  hide(dom.get('confirmInjuryButton'))
  const tempInjury = gameState.temporalInjury ?? getInjuryRecords({});
  tempInjury.forEach(a => gameRecord.push(a))
  gameState.temporalInjury = null
  closeEventModal()
  openPauseModal()
  setGameRecordsContent()
}

window.openInjuryHelp = function(index) {
  dom.get('injuryHelp').forEach((node) => {
    show(node)
  })
  if (index !== undefined && index !== null) {
    hide(dom.get('injuryHelp')[index])
  }
}

window.updateSelectedInjury = function() {
  const value = dom.get('injuryRollSelect').value
  openInjuryHelp(value)
}

window.openPass = function() {
  closeEventButtons()
  show(dom.get('passForm'))
  show(dom.get('confirmPassButton'))
  show(dom.get('eventBackButton'))
  closeTouchdown()
  closeInjury()
  setActivePassTurnAndHalf()
}

window.closePass = function() {
  hide(dom.get('confirmPassButton'))
  hide(dom.get('passForm'))
}

window.confirmPass = function() {
  hide(dom.get('passForm'))
  hide(dom.get('confirmPassButton'))
  const tempPA = gameState.temporalPass ?? getPassRecord({});
  gameRecord.push(tempPA)
  gameState.temporalPass = null
  closeEventModal()
  openPauseModal()
  setGameRecordsContent()
}

window.closeEventButtons = function() {
  hide(dom.get('eventButtons'))
}

window.openEventButtons = function() {
  show(dom.get('eventButtons'))
}

function setGameRecordsContent() {
  if (gameRecord.length > 0) {
    show(dom.get('gameRecordsContainer'))
    show(dom.get('gameRecordsContainerEndgame'))
    hide(dom.get('noGameRecordsEndgame'))
  } else {
    hide(dom.get('gameRecordsContainer'))
    hide(dom.get('gameRecordsContainerEndgame'))
    show(dom.get('noGameRecordsEndgame'))
  }
  removeChildren(gameRecordInsertionPoint)
  removeChildren(gameRecordInsertionPointEndgame)
  const content = getGameRecordContent()
  const endGamecontent = getGameRecordContent()
  content.forEach((node) => {
    dom.get('gameRecordInsertionPoint').appendChild(node)
  })
  endGamecontent.forEach((node) => {
    dom.get('gameRecordInsertionPointEndgame').appendChild(node)
  })
}

function getGameRecordContent() {
  return gameRecord.flatMap((record, index) => {
    const events = []
    const containerDiv = createDiv('')
    containerDiv.classList.add('gameRecordItem')

    if (record.event === 'TD') {
      const eventDiv = createDiv('')
      eventDiv.appendChild(getTouchdownRecordContent(record, index))
      eventDiv.appendChild(getRecordTurnContent(record, index))
      containerDiv.classList.add('gameRecordTD')
      containerDiv.appendChild(eventDiv)
    } else if (record.event === 'Suffered Injury') {
      const eventDiv = createDiv('')
      eventDiv.appendChild(getHurtInjuryRecordContent(record, index))
      eventDiv.appendChild(getRecordTurnContent(record, index))
      containerDiv.classList.add('gameRecordHS')
      containerDiv.appendChild(eventDiv)
    } else if (record.event === 'Inflicted Injury') {
      const eventDiv = createDiv('')
      eventDiv.appendChild(getHurtingInjuryRecordContent(record, index))
      eventDiv.appendChild(getRecordTurnContent(record, index))
      containerDiv.classList.add('gameRecordHI')
      containerDiv.appendChild(eventDiv)
    } else if (record.event === 'PA') {
      const eventDiv = createDiv('')
      eventDiv.appendChild(getPassRecordContent(record, index))
      eventDiv.appendChild(getRecordTurnContent(record, index))
      containerDiv.classList.add('gameRecordPass')
      containerDiv.appendChild(eventDiv)
    }

    const deleteButton = createButtonInnerHtml('', removeRecord.bind(this, index))
    const deleteSVG = createImg("/multimedia/delete_black_24dp.svg")
    deleteButton.appendChild(deleteSVG)
    containerDiv.appendChild(deleteButton)

    events.push(containerDiv)
    return events
  })
}

function removeRecord(index) {
  gameRecord.splice(index, 1)
  setGameRecordsContent()
}

function getRecordTurnContent(record, index) {
  return createDiv(`Turno ${record.half}, ${record.turn}`)
}

function getTouchdownRecordContent(record, index) {
  return createDiv(`<b>Touchdown</b> – ${getTeamName(record.team)}, jugador ${record.player}`)
}

function getHurtInjuryRecordContent(record, index) {
  return createDiv(`<b>Herida sufrida</b> (${getInjuryType(record.injuryType)}) – ${getTeamName(record.team)}, jugador ${record.player}`)
}

function getHurtingInjuryRecordContent(record, index) {
  return createDiv(`<b>Herida infligida</b> (${getInjuryType(record.injuryType)}) – ${getTeamName(record.team)}, jugador ${record.player}`)
}

function getPassRecordContent(record, index) {
  return createDiv(`<b>Pase</b> (${getPassType(record.passType)}) – ${getTeamName(record.team)}, jugador ${record.player}`)
}

function createDiv(content) {
  const node = document.createElement("div");
  // let textNode = []
  // textNode.push(document.createTextNode(content))
  // textNode.forEach((textNode) => {
  //   node.appendChild(textNode);
  // })
  node.innerHTML = content
  return node;
}

function removeChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.lastChild);
  }
}

window.onAttackingInjuryPlayerUpdate = function() {
  if (dom.get('attackingInjuryPlayerInput').checked) {
    show(dom.get('attackingInjuryPlayerForm'))
  } else {
    hide(dom.get('attackingInjuryPlayerForm'))
  }
}

window.updateSurrenderTeam = function(newValue) {
  if (newValue) {
    dom.get('surrenderConfirmButton').removeAttribute('disabled')
  } else {
    dom.get('surrenderConfirmButton').setAttribute('disabled', true)
  }
}

window.confirmSurrender = function() {
  closeSurrenderModal()
  closePauseModal()
  const surrenderTeam1 = dom.get('surrenderTeamSelect').value === 1
  if (surrenderTeam1) {
    gameState.team1.score = 0
    gameState.team2.score = 2
    gameState.team1.hasSurrendered = true
  } else {
    gameState.team2.score = 2
    gameState.team1.score = 0
    gameState.team2.hasSurrendered = true
  }
  updateTeam1()
  updateTeam2()
  setTouchdowns(gameState.team1.score, gameState.team2.score)
  gameState.finishedOnSurrender = true
  show(dom.get('winningsOnSurrender'))
  finishGame()
}

window.showRecord = function() {
  openPauseModal()
}

window.updateSelectedWeather = function(val) {
  const rows = getDomArr([
    'weatherRow1',
    'weatherRow2',
    'weatherRow3',
    'weatherRow4',
    'weatherRow5',
  ])

  const dict = {
    0: null
  }

  rows.forEach((row, index) => {
    hide(row)
    dict[index + 1] = row
  })

  const rolledValue = Number(val);
  dict[rolledValue] && show(dict[rolledValue])

  if (isLeagueGame()) {
    if (Number(val) !== 0) {
      show(dom.get('completedWeatherBtn'))
      hide(dom.get('completedWeatherBtnPls'))
    } else {
      hide(dom.get('completedWeatherBtn'))
      show(dom.get('completedWeatherBtnPls'))
    }
  }
}

window.updateSelectedKickoff = function(val) {
  const rows = getDomArr([
    'kickoffRow1',
    'kickoffRow2',
    'kickoffRow3',
    'kickoffRow4',
    'kickoffRow5',
    'kickoffRow6',
    'kickoffRow7',
    'kickoffRow8',
    'kickoffRow9',
    'kickoffRow10',
    'kickoffRow11',
  ])

  const dict = {
    0: null
  }

  rows.forEach((row, index) => {
    hide(row)
    dict[index + 1] = row
  })

  const rolledValue = Number(val);
  dict[rolledValue] && show(dict[rolledValue])

  if (isLeagueGame()) {
    if (Number(val) !== 0) {
      show(dom.get('kickoffCompleted'))
      hide(dom.get('completedKickoffBtnPls'))
    } else {
      hide(dom.get('kickoffCompleted'))
      show(dom.get('completedKickoffBtnPls'))
    }
  }
}

window.updateSelectedNuffle = function(val) {
  const rows = getDomArr([
    'nuffle1',
    'nuffle2',
    'nuffle3',
    'nuffle4',
    'nuffle5',
    'nuffle6',
    'nuffle7',
    'nuffle8',
    'nuffle9',
    'nuffle10',
    'nuffle11',
    'nuffle12',
    'nuffle13',
    'nuffle14',
    'nuffle15',
    'nuffle16',
  ])

  const dict = {
    0: null
  }

  rows.forEach((row, index) => {
    hide(row)
    dict[index + 1] = row
  })

  const rolledValue = Number(val);
  dict[rolledValue] && show(dict[rolledValue])

  if (isLeagueGame()) {
    if (Number(val) !== 0) {
      show(dom.get('completedNuffleBtn'))
      hide(dom.get('completedNuffleBtnPls'))
    } else {
      hide(dom.get('completedNuffleBtn'))
      show(dom.get('completedNuffleBtnPls'))
    }
  }
}

if (isLeagueGame()) {
  initLogin(loggedInCallback)
}

window.skipPregame = function() {
  closeFameModal()
}

window.skipNewFanFactor = function() {
  closeFanFactorModal()
  openSppModal()
}


window.finishGame = finishGame
