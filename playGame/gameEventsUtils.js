
const getTouchdownRecord = function ({
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
  ['0', 'N/A'],
  ['1', 'Stunned'],
  ['2', "KO'd"],
  ['3', 'Casualty (Badly hurt)'],
  ['4', 'Casualty (Seriously hurt)'],
  ['5', 'DEAD'],
]);

const getInjuryRecords = function(injuryEvent) {
  const injuries = []

  // Herida infligida
  if (injuryEvent.isThereHurtingTeam) {
    injuries.push(getInflictedInjuryRecord(injuryEvent))
  }

  // Herida recibida
  injuries.push(getSufferedInjuryRecord(injuryEvent))

  return injuries
}

const getInflictedInjuryRecord = function ({
  hurtingTeam = 0,
  hurtingPlayer = 0,
  injuryType = 0,
  turn = 1,
  half = 1,
}) {
  return {
    event: 'Inflicted Injury',
    team: hurtingTeam,
    player: hurtingPlayer,
    injuryType,
    turn,
    half,
  }
}

const getSufferedInjuryRecord = function ({
  hurtTeam = 0,
  hurtPlayer = 0,
  injuryType = 0,
  turn = 1,
  half = 1,
}) {
  return {
    event: 'Suffered Injury',
    team: hurtTeam,
    player: hurtPlayer,
    injuryType,
    turn,
    half,
  }
}

const getInjuryType = function (type) {
  return injuryDict.get(type)
}

const passDict = new Map([
  ['0', 'N/A'],
  ['1', 'Hand-off'],
  ['2', 'Quick Pass'],
  ['3', 'Short Pass'],
  ['4', 'Long Pass'],
  ['5', 'Long Bomb'],
]);

const getPassType = function (type) {
  return passDict.get(type)
}

const getPassRecord = function ({
  team = 1,
  player = 1,
  turn = 1,
  half = 1,
  passType = 0
}) {
  return {
    event: 'PA',
    team,
    player,
    turn,
    half,
    passType
  }
}

const getWeatherRecord = function (roll, half, turn) {
  return {
    event: 'Weather',
    roll,
    turn,
    half,
  }
}

const getKickoffRecord = function (roll, half, turn) {
  return {
    event: 'Kickoff',
    roll,
    turn,
    half,
  }
}

const getNuffleRecord = function (roll, half, turn) {
  return {
    event: 'Nuffle',
    roll,
    turn,
    half,
  }
}

export {
  getTouchdownRecord,
  getInjuryType,
  getPassRecord,
  getInjuryRecords,
  getPassType,
  getWeatherRecord,
  getKickoffRecord,
  getNuffleRecord,
}