import init from '/shared/nbba-login.js'
import { loadLeagueExcel } from '../shared/ExcelUtils.js'
import { createA, createButton, removeChildren, createOption } from '../shared/nodeUtils.js'

// state
let isLoggedIn;
let sheet;

// nodes
const moreLeagueInfo = document.querySelector('#moreLeagueInfo-insertionPoint')
const formSubmit = document.querySelector('#formSubmit-insertionPoint')
const form = document.querySelector('#form')
const team1 = document.querySelector('#team1-insertionPoint')
const team2 = document.querySelector('#team2-insertionPoint')
const checkbox = document.querySelector('#form1-checkbox')

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

function enableCheckbox() {
  checkbox.removeAttribute('disabled')
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
