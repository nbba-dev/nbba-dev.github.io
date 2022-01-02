import init from '/shared/nbba-login.js'
import { loadLeagueExcel } from '../shared/ExcelUtils.js'
import { createA, createButton, removeChildren, createOption } from '../shared/nodeUtils.js'
import { getUrlParams } from '../shared/urlParamsUtils.js'
import { getDomNodesByIds } from '../shared/domUtils'

// state
let isLoggedIn;
let sheet;

// nodes
const dom = getDomNodesByIds([
  'moreLeagueInfo',
  'formSubmit',
  'form',
  'team1',
  'team2',
  'form1Checkbox',
])

function loggedInCallback(newVal) {
  isLoggedIn = newVal
  if (isLoggedIn) {
    loadLeagueExcel()
      .then((loadedSheet) => { sheet = loadedSheet })
      .then(setMoreLeagueInfo)
      .then(setFormSubmit)
      .then(setTeams)
      .then(enableCheckbox)
  }
}

function setMoreLeagueInfo() {
  dom.get('moreLeagueInfo').appendChild(createA(sheet[2][1], sheet[1][1]))
}

function setFormSubmit() {
  removeChildren(dom.get('formSubmit'))
  const friendlyMatchButton = createButton('Partido amistoso')
  const leagueMatchButton = createButton('¡Partido de liga!')
  leagueMatchButton.addEventListener('click', () => {
    dom.get('form').setAttribute('action', '/playLeague/')
  })
  dom.get('formSubmit').appendChild(friendlyMatchButton)
  dom.get('formSubmit').appendChild(leagueMatchButton)
}

function setTeams() {
  removeChildren(dom.get('team1'))
  removeChildren(dom.get('team2'))
  dom.get('team1').appendChild(createOption('N/A', 0))
  dom.get('team2').appendChild(createOption('N/A', 0))
  sheet.forEach((row, rowIndex) => {
    if (rowIndex >= 1 && row[3]) {
      dom.get('team1').appendChild(createOption(row[3], rowIndex))
      dom.get('team2').appendChild(createOption(row[3], rowIndex))
    }
  })
}

function enableCheckbox() {
  dom.get('form1Checkbox').removeAttribute('disabled')
}


function initSetup() {
  const params = getUrlParams()
  if (params.league === 'true') {
    document.querySelector('#friendlyMatchTeam1').setAttribute('hidden', true)
    document.querySelector('#friendlyMatchTeam2').setAttribute('hidden', true)
    document.querySelector('#leagueMatchTeams').removeAttribute('hidden')
    document.querySelector('#leagueMatchRound').removeAttribute('hidden')
  } else {

  }
}

initSetup()

init(loggedInCallback)
