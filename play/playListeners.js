/* Pre - setup variables and structs */
const dom = new Map()

const addDomNodesByIds = (ids) => {
  ids.forEach((id) => {
    const nodes = [...document.querySelectorAll(`#${id}`)]
    if (nodes.length === 0) {
      alert('Error document.queryselecting on', id)
    }
    else if (nodes.length === 1) {
      dom.set(id, nodes[0])
    } else {
      dom.set(id, nodes)
    }
  })
};

/* fame */
(() => {
  addDomNodesByIds([
    'fanFactorTeam1',
    'fansRollTeam1',
    'fanFactorTeam2',
    'fansRollTeam2',
    'resultFansTeam1',
    'resultFansTeam2',
  ])

  function updateFameTeam1() {
    const newFame = Number(dom.get('fanFactorTeam1').value) + Number(dom.get('fansRollTeam1').value)
    gameState.team1.fame = newFame
    dom.get('resultFansTeam1').innerHTML = `= ${newFame}`
  }
  function updateFameTeam2() {
    const newFame = Number(dom.get('fanFactorTeam2').value) + Number(dom.get('fansRollTeam2').value)
    gameState.team2.fame = newFame
    dom.get('resultFansTeam2').innerHTML = `= ${newFame}`
  }

  dom.get('fanFactorTeam1').addEventListener('change', updateFameTeam1)
  dom.get('fansRollTeam1').addEventListener('change', updateFameTeam1)
  dom.get('fanFactorTeam2').addEventListener('change', updateFameTeam2)
  dom.get('fansRollTeam2').addEventListener('change', updateFameTeam2)
})();

/* Touchdown */
(() => {
  addDomNodesByIds([
    'touchdownTeam',
    'touchdownPlayer',
  ])

  function updateTempTouchdown() {
    const params = {
      team: Number(dom.get('touchdownTeam').value),
      player: Number(dom.get('touchdownPlayer').value),
    }
    gameState.temporalTouchdown = getTouchdownRecord(params)
  }

  dom.get('touchdownTeam').addEventListener('change', updateTempTouchdown)
  dom.get('touchdownPlayer').addEventListener('change', updateTempTouchdown)
})();


/* Injury */
(() => {
  addDomNodesByIds([
    'injuryHurtTeam',
    'injuryHurtPlayer',
    'attackingInjuryPlayerInput',
    'injuryHurtingTeam',
    'injuryHurtingPlayer',
    'injuryRollSelect',
    'confirmInjuryButton'
  ])

  function updateTempInjury() {
    const isThereHurtingPlayer = !!dom.get('attackingInjuryPlayerInput').checked
    const params = {
      hurtTeam: Number(dom.get('injuryHurtTeam').value),
      hurtPlayer: Number(dom.get('injuryHurtPlayer').value),
      isThereHurtingTeam: isThereHurtingPlayer,
      hurtingTeam: isThereHurtingPlayer ? Number(dom.get('injuryHurtingTeam').value) : null,
      hurtingPlayer: isThereHurtingPlayer ? Number(dom.get('injuryHurtingPlayer').value) : null,
      injuryType: dom.get('injuryRollSelect').value,
    }
    if (params.injuryType > 0) {
      dom.get('confirmInjuryButton').removeAttribute('disabled')
    } else {
      dom.get('confirmInjuryButton').setAttribute('disabled', true)
    }
    gameState.temporalInjury = getInjuryRecord(params)
  }

  dom.get('injuryHurtTeam').addEventListener('change', updateTempInjury)
  dom.get('injuryHurtPlayer').addEventListener('change', updateTempInjury)
  dom.get('attackingInjuryPlayerInput').addEventListener('change', updateTempInjury)
  dom.get('injuryHurtingTeam').addEventListener('change', updateTempInjury)
  dom.get('injuryHurtingPlayer').addEventListener('change', updateTempInjury)
  dom.get('injuryRollSelect').addEventListener('change', updateTempInjury)
})();