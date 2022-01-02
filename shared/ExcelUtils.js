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

export {
  loadLeagueExcel
}