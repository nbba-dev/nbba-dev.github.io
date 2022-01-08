import { getDomNodesByIds, show, hide, getDomArr } from '../shared/domUtils.js'
import { getTeamName, getActiveTurn, getActiveHalf } from './playUtils.js'
import { getTouchdownRecord, getInjuryRecords, getInjuryType, getPassRecord } from './gameEventsUtils.js'
import { initPlayListeners } from './playListeners.js';
import { initPlayModals } from './playModals.js';
import { initLogin } from '/components/nbba-login/nbba-login.js'
import { loadLeagueExcel, loadTeamsFromExcel, loadRoundsFromExcel, getTurnsBasedOnBBRules } from '../shared/excelUtils.js'
import { recordGame } from './gameRecordUtils.js';

// state
const dom = getDomNodesByIds([
  'pleaseRotate',
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
  'kickoffCompletedStandalone',
  'team1winnings',
  'team2winnings',
  'winningsFanFactorTeam1',
  'winningsFanFactorTeam2',
  'winningsFanFactorResultTeam1',
  'winningsFanFactorResultTeam2',
  'page2',
  'loadingModal'
])

let gameConfig;
let gameState = {
  hasStarted: false,
  isPaused: false,
  team1: {
    turn: 0,
    elapsedTime: 0,
    score: 0,
    name: 'Local',
    logo: '../multimedia/team0.png',
    fame: 1,
  },
  team2: {
    turn: 0,
    elapsedTime: 0,
    score: 0,
    name: 'Visitante',
    logo: '../multimedia/team0.png',
    fame: 1,
  },
  isTeam1turn: false,
  isSecondPart: false,
  endedGame: false,
  playedTimeoutForThisTurn: false,
  temporalTouchdown: null,
  temporalInjury: null,
  temporalPass: null,
}

let gameRecord = []
let clock;
let wakeLock = null;
let isInFullscreen = false;
let teams, rounds, league;
let isLoggedIn;

window.gameRecord = gameRecord
window.gameState = gameState

const timeoutAudio = new Audio('../multimedia/Timeout.mp3');
const turnAudio = new Audio('../multimedia/Turn.mp3');
const turn2Audio = new Audio('../multimedia/Turn2.mp3');

initPlayListeners(gameState)
initPlayModals(gameState)

// functions

function loggedInCallback(newVal) {
  isLoggedIn = newVal
  if (isLoggedIn) {
    const loadTeamsPromise = loadTeamsFromExcel().then((response) => { teams = response })
    const loadRoundsPromise = loadRoundsFromExcel().then((response) => { rounds = response })
    const loadLeaguePromise = loadLeagueExcel().then((response) => { league = response })

    Promise.all([loadTeamsPromise, loadRoundsPromise, loadLeaguePromise]).then(() => {
      let currentGame
      const currentRound = rounds.find(a => currentGame = a.roundGames.find(b => b.gameId == gameConfig.gameId))

      const team1 = teams.find(a => a.teamId == currentGame.team1)
      const team2 = teams.find(a => a.teamId == currentGame.team2)

      gameState.team1.name = team1.teamName
      gameState.team1.id = team1.teamId
      gameState.team1.fame = team1.teamFame
      gameState.team1.logo = team1.teamLogo

      gameState.team2.name = team2.teamName
      gameState.team2.id = team2.teamId
      gameState.team2.fame = team2.teamFame
      gameState.team2.logo = team2.teamLogo

      gameState.currentGameId = currentGame.gameId
      gameState.currentRoundNumber = currentRound.roundNumber

      gameConfig.turns = getTurnsBasedOnBBRules(league.leagueRuleset)

      initTeam1()
      initTeam2()

      updateFameTeam1()
      updateFameTeam2()

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

  if (params?.team1 === null || params?.team1 === undefined) {
    gameState.team1.name = params.team1Name
    gameState.team2.name = params.team2Name
  }

  if (!isLeagueGame()) {
    hide(dom.get('loadingModal'))
  }

  showPage2()
  initTeam1()
  initTeam2()
  if (isGuidedGame()) {
    openFameModal(0)
  }
}

function isLeagueGame() {
  return gameConfig?.isLeague === 'true'
}

function isGuidedGame() {
  return gameConfig.guided === 'on'
}

function showPage2() {
  show(dom.get('page2'))
  hide(dom.get('pleaseRotate'))
}

window.reset = function(){
  const alert = confirm("¿Seguro que quieres empezar un nuevo partido?");
  if (alert == true) {
    window.location.href = '/setupGame'
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
    restartClock()
  }
}

window.clickOnTurn1 = function() {
  const firstTurnInTheGame = !gameState.hasStarted && !gameState.isSecondPart
  const firstTurnInSecondHalf = !gameState.hasStarted && gameState.isSecondPart
  const isAlreadyHisTurn = gameState.isTeam1turn
  requestWakeLock()

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
  requestWakeLock()

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
    show(dom.get('endgameTeam1'))
  } else if (gameState.team1.score < gameState.team2.score) {
    show(dom.get('endgameTeam2'))
  } else {
    show(dom.get('endgameTeam1'))
    show(dom.get('endgameTeam2'))
  }
  startConfetti()
}

function initTeam1() {
  const team = gameState.team1
  dom.get('team1Logo').forEach((a) => a.src = team.logo)
  dom.get('team1Name').forEach((a) => a.innerHTML = team.name)
  // dom.get('team1ScoreName').innerHTML = team.name
  // dom.get('team1ScoreInput').value = '0'
}

function initTeam2() {
  const team = gameState.team2
  dom.get('team2Logo').forEach((a) => a.src = team.logo)
  dom.get('team2Name').forEach((a) => a.innerHTML = team.name)
  // dom.get('team2ScoreName').innerHTML = team.name
  // dom.get('team2ScoreInput').value = '0'
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

function setTouchdowns() {
  const touchDowns = getTouchdownsFromRecords()
  gameState.team1.score = touchDowns[0]
  gameState.team2.score = touchDowns[1]
  dom.get('team1Scoreboard').forEach((a) => a.innerHTML = touchDowns[0])
  dom.get('team2Scoreboard').forEach((a) => a.innerHTML = touchDowns[1])
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

// Function that attempts to request a wake lock.
async function requestWakeLock() {
  if (!wakeLock) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        wakeLock = null
        console.log('Wake Lock was released');
      });
      console.log('Wake Lock is active');
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

function restartClock() {
  startTime = null
  storedElapsedTime = null
  startTime = performance.now();
  cancelAnimationFrame(repaintLoop)
  startClock()
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
    setTimeout(() => {
      hide(dom.get('delayContainer'))
      turn2Audio.play()
      resolve()
    }, Number(gameConfig.delay) * 1000)
  })
}

// init

init();



window.skipPregame = function() {
  closeFameModal()
}


window.completedFame = function() {
  closeFameModal()
  openWeatherModal()
}

window.completedWeather = function() {
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
  openInducementsModal()
}

window.kickoffChangeWeather = function() {
  completedKickoff()
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
  completedKickoff()
}

window.completedKickoff = function() {
  closeKickoffModal()
}

window.completedKickoffStandalone = function() {
  closeKickoffModalStandalone()
  openPauseModal()
}

window.kickoffNuffle = function() {
  completedKickoff()
  openNuffleModal()
}

window.completedNuffle = function() {
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
  recordGame(gameState, gameRecord, league)
  openSppModal()
}
window.completedSPP = function() {
  closeSppModal()
}

window.pauseGame = function() {
  pauseClock()
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
    events.push(createButton('Eliminar registro', removeRecord.bind(this, index)))
    if (record.event === 'TD') {
      events.push(getTouchdownRecordContent(record, index))
    } else if (record.event === 'Suffered Injury') {
      events.push(getHurtInjuryRecordContent(record, index))
    } else if (record.event === 'Inflicted Injury') {
      events.push(getHurtingInjuryRecordContent(record, index))
    } else if (record.event === 'PA') {
      events.push(getPassRecordContent(record, index))
    }
    return events
  })
}

function removeRecord(index) {
  gameRecord.splice(index, 1)
  setGameRecordsContent()
}

function getTouchdownRecordContent(record, index) {
  return createDiv(`Turno ${record.half}-${record.turn} — TD para <b>${getTeamName(record.team)}</b> por jugador dorsal ${record.player}`)
}

function getHurtInjuryRecordContent(record, index) {
  return createDiv(`Turno ${record.half}-${record.turn} — para <b>${getTeamName(record.team)}</b>, ${getInjuryType(record.injuryType)} sufrido por ${record.player}`)
}

function getHurtingInjuryRecordContent(record, index) {
  return createDiv(`Turno ${record.half}-${record.turn} — por <b>${getTeamName(record.team)}</b>, ${getInjuryType(record.injuryType)} infligido por ${record.player}`)
}

function getPassRecordContent(record, index) {
  return createDiv(`Turno ${record.half}-${record.turn} — Pase completado para <b>${getTeamName(record.team)}</b> por jugador dorsal ${record.player}`)
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

function createButton(content, onclickFn) {
  const node = document.createElement("button");
  // let textNode = []
  // textNode.push(document.createTextNode(content))
  // textNode.forEach((textNode) => {
  //   node.appendChild(textNode);
  // })
  node.innerHTML = content
  node.onclick = onclickFn
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
  show(dict[rolledValue])
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
}

if (isLeagueGame()) {
  initLogin(loggedInCallback)
}

window.finishGame = finishGame