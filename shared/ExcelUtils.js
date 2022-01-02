const loadLeagueExcel = function() {
  return gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1DMWedcFO_9MvNAOhd4mTzxzhKaNsTgoSaaR_Ua5F42Q',
    range: 'A:G',
    valueRenderOption: "FORMULA"
  }).then(function(response) {
    console.log(response.result)
    return response.result.values;
  }, function(response) {
    console.log('Error: ' + response.result.error.message);
  });
}

const loadTeamsFromExcel = function () {
  return gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1NbwBzW2OqGdAvIQu-36eGODHqx0dMslzzNvYrJ0P82k',
    range: 'Equipos!A:E',
    valueRenderOption: "FORMULA"
  }).then(function(response) {
    console.log('Equipos', response.result)
    return response.result.values;
  }, function(response) {
    console.log('Error: ' + response.result.error.message);
  });
}

const loadRoundsFromExcel = function () {
  return gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1NbwBzW2OqGdAvIQu-36eGODHqx0dMslzzNvYrJ0P82k',
    range: 'Jornadas!A:F',
    valueRenderOption: "FORMULA"
  }).then(function(response) {
    // console.log('Jornadas raw', response.result)
    // console.log('Jornadas formateadas', getRounds(response.result.values))
    return getRounds(response.result.values);
  }, function(response) {
    console.log('Error: ' + response.result.error.message);
  });
}

const getRounds = function(rawXlsData) {
  const rounds = []
  rawXlsData.forEach((row) => {
    const roundNumber = row[0]
    if (typeof roundNumber === 'number') {
      let round;
      const foundSameRound = rounds.find(a => a.roundNumber === roundNumber)
      if (foundSameRound) {
        round = foundSameRound
      } else {
        round = { roundNumber: roundNumber, roundGames: [] }
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

export {
  loadLeagueExcel,
  loadTeamsFromExcel,
  loadRoundsFromExcel
}