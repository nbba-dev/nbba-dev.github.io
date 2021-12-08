
// state

const dom = addDomNodesByIds([
  'pleaseRotate',
  'team2TurnTurn',
  'team1TurnTurn',
  'half',
  'pause-turn-container',
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
  'fameModal',
  'weatherModal',
  'inducementsModal',
  'kickoffModal',
  'nuffleModal',
  'prePrayersToNuffleModal',
  'pauseModal',
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
  'settingsModal',
  'eventModal',
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

const modals = [
  /* 0 */ dom.get('fameModal'),
  /* 1 */ dom.get('weatherModal'),
  /* 2 */ dom.get('inducementsModal'),
  /* 3 */ dom.get('kickoffModal'),
  /* 4 */ dom.get('pauseModal'),
  /* 5 */ dom.get('nuffleModal'),
  /* 6 */ dom.get('prePrayersToNuffleModal'),
  /* 7 */ dom.get('settingsModal'),
  /* 8 */ dom.get('eventModal'),
]

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
      openModal(0)
    }
  } else {
    alert('ERROR')
  }
}

function showPage2() {
  pages[0].removeAttribute('hidden')
  dom.get('pleaseRotate').removeAttribute('hidden')
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
  closeModal(4)
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
    startGame()
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
    startGame()
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
  endgameOverlayNode.removeAttribute('hidden')
  if (gameState.team1.score > gameState.team2.score) {
    endgameStateNode.innerHTML = 'Ganador'
    endgameTeam1Node.removeAttribute('hidden')
  } else if (gameState.team1.score < gameState.team2.score) {
    endgameStateNode.innerHTML = 'Ganador'
    endgameTeam2Node.removeAttribute('hidden')
  } else {
    endgameStateNode.innerHTML = 'Empate'
    endgameTeam1Node.removeAttribute('hidden')
    endgameTeam2Node.removeAttribute('hidden')
  }
  startConfetti()
}

function initClock(params) {
  initTeam1()
  initTeam2()
}

function startGame() {
  dom.get('pauseTurnContainer').removeAttribute('hidden')
}

function initTeam1() {
  const team = gameState.team1
  dom.get('team1Logo').forEach((a) => a.src = team.logo)
  dom.get('team1Name').forEach((a) => a.innerHTML = team.name)
  // team1ScoreNameNode.innerHTML = team.name
  // team1ScoreInputNode.value = '0'
}

function initTeam2() {
  const team = gameState.team2
  dom.get('team2Logo').forEach((a) => a.src = team.logo)
  dom.get('team2Name').forEach((a) => a.innerHTML = team.name)
  // team2ScoreNameNode.innerHTML = team.name
  // team2ScoreInputNode.value = '0'
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
  team1TurnNode.classList.remove('notActivePlayer')
  team1TurnNode.classList.add('activePlayer')
  team2TurnNode.classList.remove('activePlayer')
  team2TurnNode.classList.add('notActivePlayer')
}

function activateTeam2() {
  team2TurnNode.classList.remove('notActivePlayer')
  team2TurnNode.classList.add('activePlayer')
  team1TurnNode.classList.remove('activePlayer')
  team1TurnNode.classList.add('notActivePlayer')
}

function setTurnover() {
  if (gameState.isTeam1turn) {
    team1TurnNode.classList.add('turnover')
  } else {
    team2TurnNode.classList.add('turnover')
  }
}

function resetTurnover() {
  team1TurnNode.classList.remove('turnover')
  team2TurnNode.classList.remove('turnover')
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
    delayContainerNode.removeAttribute('hidden')
    setTimeout(() => {
      delayContainerNode.setAttribute('hidden', true)
      turn2Audio.play()
      resolve()
    }, Number(gameConfig.delay) * 1000)
  })
}

// init

init();





function closeModal(modalIndex) {
  modals[modalIndex].setAttribute('hidden', true)
  pages[0].classList.remove('modal-active')
}

function openModal(modalIndex) {
  modals[modalIndex].removeAttribute('hidden')
  pages[0].classList.add('modal-active')
}

function skipPregame() {
  closeModal(0)
}


function completedFame() {
  closeModal(0)
  openModal(1)
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
  dom.get('weather').removeAttribute('hidden')
  closeModal(1)
  openModal(2)
}

function kickoffChangeWeather() {
  completedKickoff()
  kickoffModal.classList.remove('disableOverlay')
  openModal(1)
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
  closeModal(3)
}

function completedKickoffStandalone() {
  closeModal(3)
  openModal(4)
}

function kickoffNuffle() {
  completedKickoff()
  openModal(5)
}

function completedNuffle() {
  closeModal(5)
}

function completedInducements() {
  closeModal(2)
  openModal(6)
}

function completedPrePrayersToNuffle() {
  closeModal(6)
  openKickoffModal()
}

function openKickoffModal() {
  dom.get('kickoffCompleted').removeAttribute('hidden')
  dom.get('kickoffCompletedStandalone').setAttribute('hidden', true)
  dom.get('kickoffBackBtn').removeAttribute('hidden')
  openModal(3)
}

function openKickoffModalStandalone() {
  dom.get('kickoffCompletedStandalone').removeAttribute('hidden')
  dom.get('kickoffCompleted').setAttribute('hidden', true)
  dom.get('kickoffBackBtn').setAttribute('hidden', true)
  kickoffModal.classList.add('disableOverlay')
  openModal(3)
}

function goBackToFame() {
  closeModal(1)
  openModal(0)
}
function goBackToWeather() {
  closeModal(2)
  openModal(1)
}
function goBackToInducements() {
  closeModal(6)
  openModal(2)
}
function goBackToNuffle() {
  closeModal(3)
  openModal(6)
}

function pauseGame() {
  pauseClock()
  openModal(4)
}

function openSettingsModal() {
  closeModal(4)
  openModal(7)
}

function openEventModal() {
  dom.get('eventBackButton').setAttribute('hidden', true)
  openEventButtons()
  closeTouchdown()
  closeInjury()
  closeModal(4)
  openModal(8)
}

function closeSettingsModal() {
  closeModal(7)
  keepGoing()
}
function closeEventModal() {
  closeModal(8)
  keepGoing()
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
  dom.get('touchdownForm').removeAttribute('hidden')
  dom.get('confirmTouchdownButton').removeAttribute('hidden')
  dom.get('eventBackButton').removeAttribute('hidden')
  closeInjury()
  closePass()
  setActiveTouchdownTurnAndHalf()
}

function closeTouchdown() {
  dom.get('confirmTouchdownButton').setAttribute('hidden', true)
  dom.get('touchdownForm').setAttribute('hidden', true)
}

function confirmTouchdown() {
  dom.get('touchdownForm').setAttribute('hidden', true)
  dom.get('confirmTouchdownButton').setAttribute('hidden', true)
  const tempTd = gameState.temporalTouchdown ?? getTouchdownRecord({});
  gameRecord.push(tempTd)
  temporalTouchdown = null
  closeModal(8)
  openModal(4)
  setTouchdowns()
  setGameRecordsContent()
}

function openInjury() {
  closeEventButtons()
  closeTouchdown()
  closePass()
  dom.get('injuryForm').removeAttribute('hidden')
  dom.get('confirmInjuryButton').removeAttribute('hidden')
  dom.get('eventBackButton').removeAttribute('hidden')
  setActiveInjuryTurnAndHalf()
}

function closeInjury() {
  dom.get('confirmInjuryButton').setAttribute('hidden', true)
  dom.get('injuryForm').setAttribute('hidden', true)
}

function confirmInjury() {
  dom.get('injuryForm').setAttribute('hidden', true)
  dom.get('confirmInjuryButton').setAttribute('hidden', true)
  const tempInjury = gameState.temporalInjury ?? getInjuryRecord({});
  gameRecord.push(tempInjury)
  temporalInjury = null
  closeModal(8)
  openModal(4)
  setGameRecordsContent()
}

function openInjuryHelp(index) {
  dom.get('injuryHelp').forEach((node) => {
    node.setAttribute('hidden', true)
  })
  if (index !== undefined && index !== null) {
    dom.get('injuryHelp')[index].removeAttribute('hidden')
  }
}

function updateSelectedInjury() {
  const value = dom.get('injuryRollSelect').value
  openInjuryHelp(value)
}

function openPass() {
  closeEventButtons()
  dom.get('passForm').removeAttribute('hidden')
  dom.get('confirmPassButton').removeAttribute('hidden')
  dom.get('eventBackButton').removeAttribute('hidden')
  closeTouchdown()
  closeInjury()
  setActivePassTurnAndHalf()
}

function closePass() {
  dom.get('confirmPassButton').setAttribute('hidden', true)
  dom.get('passForm').setAttribute('hidden', true)
}

function confirmPass() {
  dom.get('passForm').setAttribute('hidden', true)
  dom.get('confirmPassButton').setAttribute('hidden', true)
  const tempPA = gameState.temporalPass ?? getPassRecord({});
  gameRecord.push(tempPA)
  temporalPass = null
  closeModal(8)
  openModal(4)
  setGameRecordsContent()
}

function closeEventButtons() {
  dom.get('eventButtons').setAttribute('hidden', true)
}

function openEventButtons() {
  dom.get('eventButtons').removeAttribute('hidden')
}

function setGameRecordsContent() {
  if (gameRecord.length > 0) {
    dom.get('gameRecordsContainer').removeAttribute('hidden')
  } else {
    dom.get('gameRecordsContainer').setAttribute('hidden', true)
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
    dom.get('attackingInjuryPlayerForm').removeAttribute('hidden')
  } else {
    dom.get('attackingInjuryPlayerForm').setAttribute('hidden', true)
  }
}

function showRecord() {
  openModal(4)
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
    row.setAttribute('hidden', true)
    dict[index + 1] = row
  })

  const rolledValue = Number(val);
  dict[rolledValue]?.removeAttribute('hidden')
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
    row.setAttribute('hidden', true)
    dict[index + 1] = row
  })

  const rolledValue = Number(val);
  dict[rolledValue]?.removeAttribute('hidden')
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
    row.setAttribute('hidden', true)
    dict[index + 1] = row
  })

  const rolledValue = Number(val);
  dict[rolledValue]?.removeAttribute('hidden')
}