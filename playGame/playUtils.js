const getTeamName = function (oneOrTwo) {
  return oneOrTwo === 1 ? gameState.team1.name : gameState.team2.name;
}

const getActiveTurn = function () {
  return gameState.isTeam1turn ? gameState.team1.turn : gameState.team2.turn;
}

const getActiveHalf = function () {
  return gameState.isSecondPart ? 2 : 1;
}

const isLeagueGame = function () {
  return gameConfig?.isLeague === 'true'
}

export {
  getTeamName,
  getActiveTurn,
  getActiveHalf,
  isLeagueGame
}