import { getDomNodesByIds, hide, show } from '../shared/domUtils.js'

const dom = getDomNodesByIds([
  'fameModal',
  'weatherModal',
  'inducementsModal',
  'kickoffModal',
  'nuffleModal',
  'prePrayersToNuffleModal',
  'pauseModal',
  'settingsModal',
  'eventModal',
  'outcomeModal',
  'winningsModal',
  'fanFactorModal',
  'sppModal',
  'page2',
  'kickoffCompleted',
  'kickoffBackBtn',
  'kickoffCompletedStandalone',
  'eventBackButton',
])

const modals = [
  /* 0 */ dom.get('fameModal'),
  /* 1 */ dom.get('weatherModal'),
  /* 2 */ dom.get('inducementsModal'),
  /* 3 */ dom.get('kickoffModal'),
  /* 4 */ dom.get('pauseModal'),
  /* 5 */ dom.get('nuffleModal'),
  /* 6 */ dom.get('prePrayersToNuffleModal'),
  /* 7 */ dom.get('settingsModal'),
  /* 8 */ dom.get('eventModal'),
  /* 9 */ dom.get('outcomeModal'),
  /* 10 */ dom.get('winningsModal'),
  /* 11 */ dom.get('fanFactorModal'),
  /* 12 */ dom.get('sppModal'),
]

function closeModal(modalIndex) {
  hide(modals[modalIndex])
  dom.get('page2').classList.remove('modal-active')
}

function openModal(modalIndex) {
  show(modals[modalIndex])
  dom.get('page2').classList.add('modal-active')
}

window.openFameModal = function() {
  openModal(0)
}
window.openWeatherModal = function() {
  openModal(1)
}
window.openInducementsModal = function() {
  openModal(2)
}
window.openKickoffModal = function() {
  openModal(3)
  show(dom.get('kickoffCompleted'))
  show(dom.get('kickoffBackBtn'))
  hide(dom.get('kickoffCompletedStandalone'))
}
window.openKickoffModalStandalone = function() {
  openModal(3)
  show(dom.get('kickoffCompletedStandalone'))
  hide(dom.get('kickoffCompleted'))
  hide(dom.get('kickoffBackBtn'))
  kickoffModal.classList.add('disableOverlay')
}
window.openPauseModal = function() {
  openModal(4)
}
window.openNuffleModal = function() {
  openModal(5)
}
window.openPrePrayersToNuffleModal = function() {
  openModal(6)
}
window.openSettingsModal = function() {
  openModal(7)
  closePauseModal()
}
window.openEventModal = function() {
  openModal(8)
  show(dom.get('eventBackButton'))
  openEventButtons()
  closeTouchdown()
  closeInjury()
  closePass()
  closePauseModal()
}
window.openOutcomeModal = function() {
  openModal(9)
}
window.openWinningsModal = function() {
  function getTeamWinnings(teamScore) {
    const fameCalc = (gameState.team1.fame + gameState.team2.fame) / 2
    return (fameCalc + teamScore) * 10
  }
  const team1Winnings = getTeamWinnings(gameState.team1.score)
  const team2Winnings = getTeamWinnings(gameState.team2.score)
  team1winnings.innerHTML = `${team1Winnings}k`
  team2winnings.innerHTML = `${team2Winnings}k`
  openModal(10)
}
window.openFanFactorModal = function() {
  winningsFanFactorTeam1.innerHTML = gameState.team1.fame
  winningsFanFactorTeam2.innerHTML = gameState.team2.fame
  openModal(11)
}
window.openSppModal = function() {
  openModal(12)
}



window.closeFameModal = function() {
  closeModal(0)
}
window.closeWeatherModal = function() {
  closeModal(1)
}
window.closeInducementsModal = function() {
  closeModal(2)
}
window.closeKickoffModal = function() {
  closeModal(3)
  hide(dom.get('kickoffCompleted'))
  hide(dom.get('kickoffBackBtn'))
  show(dom.get('kickoffCompletedStandalone'))
}
window.closeKickoffModalStandalone = function() {
  closeModal(3)
  hide(dom.get('kickoffCompletedStandalone'))
  show(dom.get('kickoffCompleted'))
  show(dom.get('kickoffBackBtn'))
  kickoffModal.classList.add('disableOverlay')
}
window.closePauseModal = function() {
  closeModal(4)
}
window.closeNuffleModal = function() {
  closeModal(5)
}
window.closePrePrayersToNuffleModal = function() {
  closeModal(6)
}
window.closeSettingsModal = function() {
  closeModal(7)
}
window.closeEventModal = function() {
  closeModal(8)
  show(dom.get('eventBackButton'))
  closeEventButtons()
  closeTouchdown()
  closeInjury()
  closePauseModal()
}
window.closeOutcomeModal = function() {
  closeModal(9)
}
window.closeWinningsModal = function() {
  closeModal(10)
}
window.closeFanFactorModal = function() {
  closeModal(11)
}
window.closeSppModal = function() {
  closeModal(12)
}