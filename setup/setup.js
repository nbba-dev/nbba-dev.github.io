import init from '/shared/nbba-login.js'

// state
let isLoggedIn;
let loadedExcel;

// nodes
const moreLeagueInfoInsertionPoint = document.querySelector('#more-league-info-insertion-point')

function loggedInCallback(loggedInStatusChanged) {
  isLoggedIn = loggedInStatusChanged
  loadLeagueExcel()
  setMoreLeagueInfo()
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
  // <a class="liga-nbba" target="_blank" href="https://api.sheet2site.com/api/v3/index.php?key=1sRx1FEHpiUjPxJHhjsOi_LTsLQDFQLTF-lxpLb_AOd0&g=1">Liga NBBA III</a>
}

function loadLeagueExcel() {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1DMWedcFO_9MvNAOhd4mTzxzhKaNsTgoSaaR_Ua5F42Q',
    // spreadsheetId: '1VjjpG46Z36oMZPSlx2bipgiu3pCvB1F-ZsRh4qpJ7JE',
    range: 'A:G',
    valueRenderOption: "FORMULA"
  }).then(function(response) {
    loadedExcel = response.result.values;
    console.log(response.result)
    setMoreLeagueInfo()
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
