
// state

addDomNodesByIds([
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
  'endgameState',
  'endgameOverlay',
  'weatherValue',
  'weather',
  'touchdownForm',
  'injuryForm',
  'injuryRollSelect',
  'gameRecordInsertionPoint',
  'attackingInjuryPlayerInput',
  'attackingInjuryPlayerForm',
  'gameRecordsContainer',
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
])

const pages = [
  document.querySelector('#page2'),
];

let gameConfig;
let gameState = {
  hasStarted: false,
  isPaused: false,
  team1: {
    turn: 0,
    elapsedTime: 0,
    score: 0,
    name: 'Local',
    logo: 'team0.png',
    fame: 1,
  },
  team2: {
    turn: 0,
    elapsedTime: 0,
    score: 0,
    name: 'Visitante',
    logo: 'team0.png',
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

const timeoutAudio = new Audio('Timeout.mp3');
const turnAudio = new Audio('Turn.mp3');
const turn2Audio = new Audio('Turn2.mp3');

// functions

function init() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  gameConfig = params;
  gameConfig.time = Number(params.time) + 1; // para que empiece en el minuto exacto
  gameConfig.delay = gameConfig.delay ?? 2;


  if (params?.team1 !== null && params?.team1 !== undefined) {
    showPage2()
    initClock(params)
    if (gameConfig.guided === 'on') {
      // TODO - REMOVE
      // openFameModal(0)
    }
  } else {
    alert('ERROR')
  }
}

function showPage2() {
  show(pages[0])
  hide(dom.get('pleaseRotate'))
}

function reset(){
  const alert = confirm("¿Seguro que quieres empezar un nuevo partido?");
  if (alert == true) {
    window.location.href = './'
  }
}

function keepGoing() {
  if (gameState.hasStarted) {
    startClock()
  }
  closeTouchdown()
  closeInjury()
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
  gameState[newPlayer].elapsedTime = 0
  gameState[newPlayer].turn += 1
  gameState.playedTimeoutForThisTurn = false

  if (hasJustFinishedAHalf) {
    finishedHalf(newPlayer)
    pauseClock()
  } else {
    restartClock()
  }
}

function clickOnTurn1() {
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

function clickOnTurn2() {
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
    openKickoffModal()
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
    dom.get('endgameState').innerHTML = 'Ganador'
    show(dom.get('endgameTeam1'))
  } else if (gameState.team1.score < gameState.team2.score) {
    dom.get('endgameState').innerHTML = 'Ganador'
    show(dom.get('endgameTeam2'))
  } else {
    dom.get('endgameState').innerHTML = 'Empate'
    show(dom.get('endgameTeam1'))
    show(dom.get('endgameTeam2'))
  }
  startConfetti()
}

function initClock(params) {
  initTeam1()
  initTeam2()
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
    const remainingTimeInString = `${getRawMinutes(remainingTime)}:${getRawSeconds(remainingTime)}`
    if (gameState.isTeam1turn) {
      dom.get('team1TurnTime').innerHTML = remainingTimeInString
    } else {
      dom.get('team2TurnTime').innerHTML = remainingTimeInString
    }
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

function goFullscreen() {
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



function skipPregame() {
  closeFameModal()
}


function completedFame() {
  closeFameModal()
  openWeatherModal()
}

function completedWeather() {
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

function kickoffChangeWeather() {
  completedKickoff()
  kickoffModal.classList.remove('disableOverlay')
  openWeatherModal()
}

function kickoffTimeout() {
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

function completedKickoff() {
  closeKickoffModal()
}

function completedKickoffStandalone() {
  closeKickoffModalStandalone()
  openPauseModal()
}

function kickoffNuffle() {
  completedKickoff()
  openNuffleModal()
}

function completedNuffle() {
  closeNuffleModal()
}

function completedInducements() {
  closeInducementsModal()
  openPrePrayersToNuffleModal()
}

function completedPrePrayersToNuffle() {
  closePrePrayersToNuffleModal()
  openKickoffModal()
}

function goBackToFame() {
  closeWeatherModal()
  openFameModal(0)
}
function goBackToWeather() {
  closeInducementsModal()
  openWeatherModal()
}
function goBackToInducements() {
  closePrePrayersToNuffleModal()
  openInducementsModal()
}
function goBackToNuffle() {
  closeKickoffModal()
  openPrePrayersToNuffleModal()
}

function pauseGame() {
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

function openTouchdown() {
  closeEventButtons()
  hide(dom.get('touchdownForm'))
  hide(dom.get('confirmTouchdownButton'))
  hide(dom.get('eventBackButton'))
  closeInjury()
  closePass()
  setActiveTouchdownTurnAndHalf()
}

function closeTouchdown() {
  show(dom.get('confirmTouchdownButton'))
  show(dom.get('touchdownForm'))
}

function confirmTouchdown() {
  show(dom.get('touchdownForm'))
  show(dom.get('confirmTouchdownButton'))
  const tempTd = gameState.temporalTouchdown ?? getTouchdownRecord({});
  gameRecord.push(tempTd)
  temporalTouchdown = null
  closeEventModal()
  openPauseModal()
  setTouchdowns()
  setGameRecordsContent()
}

function openInjury() {
  closeEventButtons()
  closeTouchdown()
  closePass()
  hide(dom.get('injuryForm'))
  hide(dom.get('confirmInjuryButton'))
  hide(dom.get('eventBackButton'))
  setActiveInjuryTurnAndHalf()
}

function closeInjury() {
  show(dom.get('confirmInjuryButton'))
  show(dom.get('injuryForm'))
}

function confirmInjury() {
  show(dom.get('injuryForm'))
  show(dom.get('confirmInjuryButton'))
  const tempInjury = gameState.temporalInjury ?? getInjuryRecord({});
  gameRecord.push(tempInjury)
  temporalInjury = null
  closeEventModal()
  openPauseModal()
  setGameRecordsContent()
}

function openInjuryHelp(index) {
  dom.get('injuryHelp').forEach((node) => {
    hide(node)
  })
  if (index !== undefined && index !== null) {
    show(dom.get('injuryHelp')[index])
  }
}

function updateSelectedInjury() {
  const value = dom.get('injuryRollSelect').value
  openInjuryHelp(value)
}

function openPass() {
  closeEventButtons()
  hide(dom.get('passForm'))
  hide(dom.get('confirmPassButton'))
  hide(dom.get('eventBackButton'))
  closeTouchdown()
  closeInjury()
  setActivePassTurnAndHalf()
}

function closePass() {
  show(dom.get('confirmPassButton'))
  show(dom.get('passForm'))
}

function confirmPass() {
  show(dom.get('passForm'))
  show(dom.get('confirmPassButton'))
  const tempPA = gameState.temporalPass ?? getPassRecord({});
  gameRecord.push(tempPA)
  temporalPass = null
  closeEventModal()
  openPauseModal()
  setGameRecordsContent()
}

function closeEventButtons() {
  show(dom.get('eventButtons'))
}

function openEventButtons() {
  hide(dom.get('eventButtons'))
}

function setGameRecordsContent() {
  if (gameRecord.length > 0) {
    hide(dom.get('gameRecordsContainer'))
  } else {
    show(dom.get('gameRecordsContainer'))
  }
  removeChildren(gameRecordInsertionPoint)
  const content = getGameRecordContent()
  content.forEach((node) => {
    dom.get('gameRecordInsertionPoint').appendChild(node)
  })
}

function getGameRecordContent() {
  return gameRecord.flatMap((record, index) => {
    const events = []
    events.push(createButton('Eliminar registro', removeRecord.bind(this, index)))
    if (record.event === 'TD') {
      events.push(getTouchdownRecordContent(record, index))
    } else if (record.event === 'Injury') {
      events.push(getHurtInjuryRecordContent(record, index))
      if (record.isThereHurtingTeam) {
        events.push(getHurtingInjuryRecordContent(record, index))
      }
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
  return createDiv(`Turno ${record.half}-${record.turn} — para <b>${getTeamName(record.hurtTeam)}</b>, ${getInjuryType(record.injuryType)} sufrido por ${record.hurtPlayer}`)
}

function getHurtingInjuryRecordContent(record, index) {
  return createDiv(`Turno ${record.half}-${record.turn} — por <b>${getTeamName(record.hurtingTeam)}</b>, ${getInjuryType(record.injuryType)} infligido por ${record.hurtingPlayer}`)
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

function onAttackingInjuryPlayerUpdate() {
  if (dom.get('attackingInjuryPlayerInput').checked) {
    hide(dom.get('attackingInjuryPlayerForm'))
  } else {
    show(dom.get('attackingInjuryPlayerForm'))
  }
}

function showRecord() {
  openPauseModal()
}

function getDomArr(ids) {
  const domArr = []
  ids.forEach((id) => {
    domArr.push(document.querySelector(`#${id}`))
  })
  return domArr
}

function updateSelectedWeather(val) {
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

function updateSelectedKickoff(val) {
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
  show(dict[rolledValue])
}

function updateSelectedNuffle(val) {
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
  show(dict[rolledValue])
}