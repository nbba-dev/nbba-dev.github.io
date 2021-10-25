
// state

const pleaseRotateNode = document.querySelector('#pleaseRotate')
const team2TurnTurnNode = document.querySelector('#team2-turn-turn')
const team1TurnTurnNode = document.querySelector('#team1-turn-turn')
const halfNodes = [...document.querySelectorAll('#half')]
const pauseTurnContainerNode = document.querySelector('#pause-turn-container')
const team1NameNodes = [...document.querySelectorAll('#team1-name')]
const team1LogoNodes = [...document.querySelectorAll('#team1-logo')]
// const team1ScoreNameNode = document.querySelector('#team1-score-name')
// const team1ScoreInputNode = document.querySelector('#team1-score-input')
const team2NameNodes = [...document.querySelectorAll('#team2-name')]
const team2LogoNodes = [...document.querySelectorAll('#team2-logo')]
// const team2ScoreNameNode = document.querySelector('#team2-score-name')
// const team2ScoreInputNode = document.querySelector('#team2-score-input')
const team1TurnTimeNode = document.querySelector('#team1-turn-time')
const team2TurnTimeNode = document.querySelector('#team2-turn-time')
const team1ScoreboardNodes = [...document.querySelectorAll("#team1-scoreboard")]
const team2ScoreboardNodes = [...document.querySelectorAll("#team2-scoreboard")]
const team1TurnNode = document.querySelector('#team1-turn')
const team2TurnNode = document.querySelector('#team2-turn')
const delayContainerNode = document.querySelector('#delay-container')
const endgameTeam1Node = document.querySelector('#endgame-team1')
const endgameTeam2Node = document.querySelector('#endgame-team2')
const endgameStateNode = document.querySelector('#endgame-state')
const endgameOverlayNode = document.querySelector('#endgame-overlay')
const fameModal = document.querySelector('#fameModal')
const weatherModal = document.querySelector('#weatherModal')
const inducementsModal = document.querySelector('#inducementsModal')
const kickoffModal = document.querySelector('#kickoffModal')
const nuffleModal = document.querySelector('#nuffleModal')
const pauseModal = document.querySelector('#pauseModal')
const weatherValue = document.querySelector('#weatherValue')
const weather = document.querySelector('#weather')

const pages = [
  document.querySelector('#page2'),
];

const modals = [
  fameModal,
  weatherModal,
  inducementsModal,
  kickoffModal,
  pauseModal,
  nuffleModal
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
    logo: 'team0.png'
  },
  team2: {
    turn: 0,
    elapsedTime: 0,
    score: 0,
    name: 'Visitante',
    logo: 'team0.png'
  },
  isTeam1turn: false,
  isSecondPart: false,
  endedGame: false,
  playedTimeoutForThisTurn: false,
  initialWeatherComplete: false
}
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
  pleaseRotateNode.removeAttribute('hidden')
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
  setTouchdowns()
  closeModal(3)
}

function startTurn1() {
  turnAudio.play()
  const hasJustFinishedAHalf = gameState.team1.turn === Number(gameConfig.turns)
  gameState.isTeam1turn = true
  startTurn('team1', hasJustFinishedAHalf)
  team1TurnTurnNode.innerHTML = gameState.team1.turn
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
  team2TurnTurnNode.innerHTML = gameState.team2.turn
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
  const firstTurnInTheGame = !gameState.hasStarted
  const isAlreadyHisTurn = gameState.isTeam1turn
  requestWakeLock()

  if (firstTurnInTheGame) {
    gameState.hasStarted = true
    startGame()
    startTurn1()
  } else if (isAlreadyHisTurn) {
    startTurn2()
  }
}

function clickOnTurn2() {
  const firstTurnInTheGame = !gameState.hasStarted
  const isAlreadyHisTurn = !gameState.isTeam1turn
  requestWakeLock()

  if (firstTurnInTheGame) {
    gameState.hasStarted = true
    startGame()
    startTurn2()
  } else if (isAlreadyHisTurn) {
    startTurn1()
  }
}

function finishedHalf(startingTeam) {
  gameState.team1.turn = 0
  gameState.team2.turn = 0
  team1TurnTurnNode.innerHTML = gameState.team1.turn
  team2TurnTurnNode.innerHTML = gameState.team2.turn
  if (startingTeam === 'team1') {
    team2TurnTimeNode.innerHTML = 'Comienza segunda parte'
  } else {
    team1TurnTimeNode.innerHTML = 'Comienza segunda parte'
  }

  if (!gameState.isSecondPart) {
    halfNodes.forEach(a => a.innerHTML = 'Segunda Parte')
    gameState.isSecondPart = true
  } else {
    halfNodes.forEach(a => a.innerHTML = '¡Fin del partido!')
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
  pauseTurnContainerNode.removeAttribute('hidden')
}

function initTeam1() {
  const team = gameState.team1
  team1LogoNodes.forEach((a) => a.src = team.logo)
  team1NameNodes.forEach((a) => a.innerHTML = team.name)
  // team1ScoreNameNode.innerHTML = team.name
  // team1ScoreInputNode.value = '0'
}

function initTeam2() {
  const team = gameState.team2
  team2LogoNodes.forEach((a) => a.src = team.logo)
  team2NameNodes.forEach((a) => a.innerHTML = team.name)
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
      team1TurnTimeNode.innerHTML = remainingTimeInString
    } else {
      team2TurnTimeNode.innerHTML = remainingTimeInString
    }
  }
}

function setTouchdowns() {
  gameState.team1.score = team1ScoreInputNode.value
  gameState.team2.score = team2ScoreInputNode.value
  team1ScoreboardNodes.forEach((a) => a.innerHTML = team1ScoreInputNode.value)
  team2ScoreboardNodes.forEach((a) => a.innerHTML = team2ScoreInputNode.value)
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


function completedFame() {
  closeModal(0)
  openModal(1)
}

function completedWeather() {
  const valueForWeather = Number(weatherValue.value)
  const weatherDict = {
    2: '🔥',
    3: '☀️',
    11: '🌨',
    12: '❄️',
    // else: '🌤'
  }
  weather.innerText = weatherDict[valueForWeather] || ''
  weather.removeAttribute('hidden')
  closeModal(1)
  if (!gameState.initialWeatherComplete) {
    gameState.initialWeatherComplete = true
    openModal(2)
  }
}

function kickoffChangeWeather() {
  completedKickoff()
  openModal(1)
}

function kickoffTimeout() {
  // TODO - change turns
  completedKickoff()
}

function completedKickoff() {
  closeModal(3)
}

function pauseGame() {
  pauseClock()
  openModal(4)
}

function kickoffNuffle() {
  completedKickoff()
  openModal(5)
}

function completedInducements() {
  closeModal(2)
  openModal(3)
}