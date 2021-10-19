import loadedGapiPromise from '/shared/nbba-login.js'

loadedGapiPromise.then(() => {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1DMWedcFO_9MvNAOhd4mTzxzhKaNsTgoSaaR_Ua5F42Q',
    // spreadsheetId: '1VjjpG46Z36oMZPSlx2bipgiu3pCvB1F-ZsRh4qpJ7JE',
    range: 'A2:E',
  }).then(function(response) {
    var range = response.result;
    console.log(range)
  }, function(response) {
    console.log('Error: ' + response.result.error.message);
  });
})