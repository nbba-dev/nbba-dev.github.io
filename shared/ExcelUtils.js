const loadLeagueExcel = function() {
  return gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1NbwBzW2OqGdAvIQu-36eGODHqx0dMslzzNvYrJ0P82k',
    range: 'A2:C2',
    valueRenderOption: "FORMULA"
  }).then(function(response) {
    // console.log('Info de liga raw', response.result)
    console.log('Info de liga', getLeagueInfo(response.result.values))
    return getLeagueInfo(response.result.values);
  }, function(response) {
    console.log('Error: ' + response.result.error.message);
  });
}

const loadTeamsFromExcel = function () {
  return gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1NbwBzW2OqGdAvIQu-36eGODHqx0dMslzzNvYrJ0P82k',
    range: 'Equipos!A2:E9',
    valueRenderOption: "FORMULA"
  }).then(function(response) {
    // console.log('Equipos raw', response.result)
    console.log('Equipos formateados', getTeams(response.result.values))
    return getTeams(response.result.values);
  }, function(response) {
    console.log('Error: ' + response.result.error.message);
  });
}

const loadRoundsFromExcel = function () {
  return gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1NbwBzW2OqGdAvIQu-36eGODHqx0dMslzzNvYrJ0P82k',
    range: 'Jornadas!A2:D30',
    valueRenderOption: "FORMULA"
  }).then(function(response) {
    // console.log('Jornadas raw', response.result)
    console.log('Jornadas formateadas', getRounds(response.result.values))
    return getRounds(response.result.values);
  }, function(response) {
    console.log('Error: ' + response.result.error.message);
  });
}

const getLeagueInfo = function(rawXlsData) {
  const leagueInfo = {
    leagueName: rawXlsData[0][0],
    leagueLink: rawXlsData[0][1],
    leagueRuleset: rawXlsData[0][2],
  }
  return leagueInfo
}

const getRounds = function(rawXlsData) {
  const rounds = []
  rawXlsData.forEach((row) => {
    const roundNumber = row[0]
    if (roundNumber >= 0) {
      let round;
      const foundSameRound = rounds.find(a => a.roundNumber === roundNumber)
      if (foundSameRound) {
        round = foundSameRound
      } else {
        round = { roundNumber: roundNumber, roundGames: [], roundDates: row[3] }
        rounds.push(round)
      }
      round.roundGames.push({
        team1: row[1],
        team2: row[2]
      })
    }
  })

  return rounds
}

const getTeams = function(rawXlsData) {
  const teams = []
  rawXlsData.forEach((row) => {
    teams.push({
      teamId: row[0],
      teamName: row[1],
      teamTrainer: row[2],
      teamRoster: row[3],
      teamLogo: row[4],
    })
  })

  return teams
}

export {
  loadLeagueExcel,
  loadTeamsFromExcel,
  loadRoundsFromExcel
}