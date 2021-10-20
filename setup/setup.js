import init from '/shared/nbba-login.js'

// state
let isLoggedIn;
let sheet;

// nodes
const moreLeagueInfo = document.querySelector('#moreLeagueInfo-insertionPoint')
const formSubmit = document.querySelector('#formSubmit-insertionPoint')
const form = document.querySelector('#form')
const team1 = document.querySelector('#team1-insertionPoint')
const team2 = document.querySelector('#team2-insertionPoint')

function loggedInCallback(newVal) {
  isLoggedIn = newVal
  if (isLoggedIn) {
    loadLeagueExcel()
      .then(setMoreLeagueInfo)
      .then(setFormSubmit)
      .then(setTeams)
  }
}

function setMoreLeagueInfo() {
  moreLeagueInfo.appendChild(createA(sheet[2][1], sheet[1][1]))
}

function setFormSubmit() {
  removeChildren(formSubmit)
  const friendlyMatchButton = createButton('Partido amistoso')
  const leagueMatchButton = createButton('¡Partido de liga!')
  leagueMatchButton.addEventListener('click', () => {
    form.setAttribute('action', '/playLeague/')
  })
  formSubmit.appendChild(friendlyMatchButton)
  formSubmit.appendChild(leagueMatchButton)
}

function createA(text, href) {
  const node = document.createElement('a');
  const textNode = document.createTextNode(text);
  node.appendChild(textNode);
  node.title = text;
  node.href = href;
  node.target = '_blank'
  return node;
}

function createButton(text) {
  const node = document.createElement("button");
  const textNode = document.createTextNode(text);
  node.appendChild(textNode);
  node.title = text;
  node.type = "submit";
  return node;
}

function removeChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.lastChild);
  }
}

function setTeams() {
  removeChildren(team1)
  removeChildren(team2)
  team1.appendChild(createOption('N/A', 0))
  team2.appendChild(createOption('N/A', 0))
  sheet.forEach((row, rowIndex) => {
    if (rowIndex >= 1 && row[3]) {
      team1.appendChild(createOption(row[3], rowIndex))
      team2.appendChild(createOption(row[3], rowIndex))
    }
  })
}

function createOption(text, value) {
  const node = document.createElement("option");
  const textNode = document.createTextNode(text);
  node.appendChild(textNode);
  node.title = text;
  node.value = value;
  return node;
  // <option value="0" selected>Equipo Local</option>
}

function loadLeagueExcel() {
  return gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: '1DMWedcFO_9MvNAOhd4mTzxzhKaNsTgoSaaR_Ua5F42Q',
    range: 'A:G',
    valueRenderOption: "FORMULA"
  }).then(function(response) {
    sheet = response.result.values;
    console.log(response.result)
  }, function(response) {
    console.log('Error: ' + response.result.error.message);
  });
}

init(loggedInCallback)
