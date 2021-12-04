function getTeamName(oneOrTwo) {
  return oneOrTwo === 1 ? gameState.team1.name : gameState.team2.name;
}

function getActiveTurn() {
  return gameState.isTeam1turn ? gameState.team1.turn : gameState.team2.turn;
}

function getActiveHalf() {
  return gameState.isSecondPart ? 2 : 1;
}

function getTouchdownRecord({
  team = 1,
  player = 1,
  turn = 1,
  half = 1,
}) {
  return {
    event: 'TD',
    team,
    player,
    turn,
    half,
  }
}

const injuryDict = new Map([
  ['0', 'Stunned'],
  ['1', "KO'd"],
  ['2', 'Casualty (Badly hurt)'],
  ['3', 'Casualty (Seriously hurt)'],
  ['4', 'DEAD'],
]);


function getInjuryRecord({
  hurtTeam = 0,
  hurtPlayer = 0,
  isThereHurtingTeam = false,
  hurtingTeam = 0,
  hurtingPlayer = 0,
  injuryType = 0,
  turn = 1,
  half = 1,
}) {
  return {
    event: 'Injury',
    hurtTeam,
    hurtPlayer,
    isThereHurtingTeam,
    hurtingTeam,
    hurtingPlayer,
    injuryType,
    turn,
    half,
  }
}

function getInjuryType(type) {
  return injuryDict.get(type)
}