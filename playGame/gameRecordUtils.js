import { mapGameRecordToExcelCells } from '../shared/excelUtils.js'

const recordGame = function (gameState, gameRecord, league) {
  console.log('gameState', gameState)
  console.log('gameRecord', gameRecord)

  const sheetId = league.leagueGameRecordsSheetId
  const spreadsheetId = league.leagueGameRecordsSpreadsheetId
  const duplicateSheetRequest = gapi.client.sheets.spreadsheets.sheets.copyTo({ spreadsheetId: spreadsheetId, sheetId: sheetId }, { destinationSpreadsheetId: spreadsheetId });

  duplicateSheetRequest.then((response) => {
    console.log(response)

    const newSheetName = response.result.title
    const newSheetId = response.result.sheetId

    const updateGameValuesRequest = gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: `${newSheetName}!B1:B11`,
      valueInputOption: 'RAW',
      resource: {
        values: [
          [new Date().toString()],                // B1
          [league.leagueName],                    // B2
          [gameState.currentGameId],              // B3
          [gameState.team1.name],                 // B4
          [gameState.team2.name],                 // B5
          [gameState.team1.score],                // B6
          [gameState.team2.score],                // B7
          [gameState.team1.fame],                 // B8
          [gameState.team2.fame],                 // B9
          [gameState.team1.elapsedTime / 1000],   // B10
          [gameState.team2.elapsedTime / 1000],   // B11
        ]
      }
    }).then((response) => {
      var result = response.result;
      console.log(`${result.updatedCells} cells updated.`);
    });

    if (gameRecord.length > 0) {
      const gameRecordCells = gameRecord.map(mapGameRecordToExcelCells)
      const updateGameRecordValuesRequest = gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `${newSheetName}!D2:L${2 + gameRecord.length}`,
        valueInputOption: 'RAW',
        resource: {
          values: gameRecordCells
        }
      }).then((response) => {
        var result = response.result;
        console.log(`${result.updatedCells} game record cells updated.`);
      });
    }


    const renameSheetRequest = gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                title: `Jornada ${gameState.currentRoundNumber} - Partido ${gameState.currentGameId}`,
                sheetId: newSheetId
              },
              fields: 'title'
            }
          }
        ]
      }
    }).then((response) => {
      var result = response.result;
      console.log('renombrada hoja', result);
    });
  })


}

export {
  recordGame
}