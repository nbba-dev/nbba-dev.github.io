import { getDomNodesByIds } from '../shared/domUtils.js'

/* fame */
(() => {
  const dom = getDomNodesByIds([
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
  const dom = getDomNodesByIds([
    'touchdownTeam',
    'touchdownPlayer',
    'touchdownTurn',
    'touchdownHalf',
  ])

  function updateTempTouchdown() {
    const params = {
      team: Number(dom.get('touchdownTeam').value),
      player: Number(dom.get('touchdownPlayer').value),
      turn: dom.get('touchdownTurn').value,
      half: dom.get('touchdownHalf').value,
    }
    gameState.temporalTouchdown = getTouchdownRecord(params)
  }

  dom.get('touchdownTeam').addEventListener('change', updateTempTouchdown)
  dom.get('touchdownPlayer').addEventListener('change', updateTempTouchdown)
})();


/* Injury */
(() => {
  const dom = getDomNodesByIds([
    'injuryHurtTeam',
    'injuryHurtPlayer',
    'attackingInjuryPlayerInput',
    'injuryHurtingTeam',
    'injuryHurtingPlayer',
    'injuryRollSelect',
    'confirmInjuryButton',
    'injuryTurn',
    'injuryHalf',
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
      turn: dom.get('injuryTurn').value,
      half: dom.get('injuryHalf').value,
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


/* Pass */
(() => {
  const dom = getDomNodesByIds([
    'passTeam',
    'passPlayer',
    'passTurn',
    'passHalf',
  ])

  function updateTempPass() {
    const params = {
      team: Number(dom.get('passTeam').value),
      player: Number(dom.get('passPlayer').value),
      turn: dom.get('passTurn').value,
      half: dom.get('passHalf').value,
    }
    gameState.temporalPass = getPassRecord(params)
  }

  dom.get('passTeam').addEventListener('change', updateTempPass)
  dom.get('passPlayer').addEventListener('change', updateTempPass)
})();