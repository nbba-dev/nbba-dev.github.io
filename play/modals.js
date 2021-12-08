addDomNodesByIds([
  'fameModal',
  'weatherModal',
  'inducementsModal',
  'kickoffModal',
  'nuffleModal',
  'prePrayersToNuffleModal',
  'pauseModal',
  'settingsModal',
  'eventModal',
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
]

function closeModal(modalIndex) {
  hide(modals[modalIndex])
  pages[0].classList.remove('modal-active')
}

function openModal(modalIndex) {
  show(modals[modalIndex])
  pages[0].classList.add('modal-active')
}

function openFameModal() {
  openModal(0)
}
function openWeatherModal() {
  openModal(1)
}
function openInducementsModal() {
  openModal(2)
}
function openKickoffModal() {
  openModal(3)
  hide(dom.get('kickoffCompleted'))
  hide(dom.get('kickoffBackBtn'))
  show(dom.get('kickoffCompletedStandalone'))
}
function openKickoffModalStandalone() {
  openModal(3)
  hide(dom.get('kickoffCompletedStandalone'))
  show(dom.get('kickoffCompleted'))
  show(dom.get('kickoffBackBtn'))
  kickoffModal.classList.add('disableOverlay')
}
function openPauseModal() {
  openModal(4)
}
function openNuffleModal() {
  openModal(5)
}
function openPrePrayersToNuffleModal() {
  openModal(6)
}
function openSettingsModal() {
  openModal(7)
  closePauseModal()
}
function openEventModal() {
  openModal(8)
  show(dom.get('eventBackButton'))
  openEventButtons()
  closeTouchdown()
  closeInjury()
  closePauseModal()
}

function closeFameModal() {
  closeModal(0)
}
function closeWeatherModal() {
  closeModal(1)
}
function closeInducementsModal() {
  closeModal(2)
}
function closeKickoffModal() {
  closeModal(3)
  hide(dom.get('kickoffCompleted'))
  hide(dom.get('kickoffBackBtn'))
  show(dom.get('kickoffCompletedStandalone'))
}
function closeKickoffModalStandalone() {
  closeModal(3)
  hide(dom.get('kickoffCompletedStandalone'))
  show(dom.get('kickoffCompleted'))
  show(dom.get('kickoffBackBtn'))
  kickoffModal.classList.add('disableOverlay')
}
function closePauseModal() {
  closeModal(4)
}
function closeNuffleModal() {
  closeModal(5)
}
function closePrePrayersToNuffleModal() {
  closeModal(6)
}
function closeSettingsModal() {
  closeModal(7)
}
function closeEventModal() {
  closeModal(8)
  show(dom.get('eventBackButton'))
  closeEventButtons()
  closeTouchdown()
  closeInjury()
  closePauseModal()
}