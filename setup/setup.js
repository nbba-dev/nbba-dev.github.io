import init from '/shared/nbba-login.js'

// state
let isLoggedIn;
let loadedExcel;

// nodes
const moreLeagueInfoInsertionPoint = document.querySelector('#more-league-info-insertion-point')

function loggedInCallback(newVal) {
  if (newVal === false && isLoggedIn === true) {
    window.location.reload()
  }

  isLoggedIn = newVal
  if (isLoggedIn) {
    loadLeagueExcel().then(setMoreLeagueInfo)
  }
}

function setMoreLeagueInfo() {
  if (isLoggedIn && loadedExcel) {
    moreLeagueInfoInsertionPoint.appendChild(createA(loadedExcel[2][1], loadedExcel[1][1]))
  }
}

function createA(text, href) {
  const aTag = document.createElement('a');
  const linkText = document.createTextNode(text);
  aTag.appendChild(linkText);
  aTag.title = text;
  aTag.href = href;
  aTag.target = '_blank'
  return aTag;
}

function loadLeagueExcel() {
  return gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1DMWedcFO_9MvNAOhd4mTzxzhKaNsTgoSaaR_Ua5F42Q',
    range: 'A:G',
    valueRenderOption: "FORMULA"
  }).then(function(response) {
    loadedExcel = response.result.values;
    console.log(response.result)
    // range.values.forEach((a, index) => {
    //   if (index < 9) {
    //     document.querySelector(`#team${index}`).innerHTML = a[0]
    //   }
    // })
  }, function(response) {
    console.log('Error: ' + response.result.error.message);
  });
}

init(loggedInCallback)
