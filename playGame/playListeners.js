import { getDomNodesByIds, show, hide } from '../shared/domUtils.js'
import { isLeagueGame } from './playUtils.js'
import { getTouchdownRecord, getInjuryRecords, getPassRecord } from './gameEventsUtils.js'

const initPlayListeners = function (externalGameState) {
  let gameState = externalGameState;

  /* fame */
  (() => {
    const dom = getDomNodesByIds([
      'fanFactorTeam1',
      'fansRollTeam1',
      'fanFactorTeam2',
      'fansRollTeam2',
      'resultFansTeam1',
      'resultFansTeam2',
      'completedFameBtn',
      'completedFameBtnPls',
    ])

    window.updateFameTeam1 = function() {
      dom.get('fanFactorTeam1').value = gameState.team1.fame
      const newFame = Number(dom.get('fanFactorTeam1').value) + Number(dom.get('fansRollTeam1').value)
      gameState.team1.fame = newFame
      dom.get('resultFansTeam1').innerHTML = `= ${newFame}`
      testEnableFameContinue()
    }
    window.updateFameTeam2 = function() {
      dom.get('fanFactorTeam2').value = gameState.team2.fame
      const newFame = Number(dom.get('fanFactorTeam2').value) + Number(dom.get('fansRollTeam2').value)
      gameState.team2.fame = newFame
      dom.get('resultFansTeam2').innerHTML = `= ${newFame}`
      testEnableFameContinue()
    }

    const testEnableFameContinue = function() {
      if (isLeagueGame()) {
        if (dom.get('fansRollTeam1').value !== '0' && dom.get('fansRollTeam2').value !== '0') {
          show(dom.get('completedFameBtn'))
          hide(dom.get('completedFameBtnPls'))
        } else {
          hide(dom.get('completedFameBtn'))
          show(dom.get('completedFameBtnPls'))
        }
      }
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

    window.updateTempTouchdown = function() {
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

    window.updateTempInjury = function() {
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
      gameState.temporalInjury = getInjuryRecords(params)
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
      'passType',
    ])

    window.updateTempPass = function() {
      const params = {
        team: Number(dom.get('passTeam').value),
        player: Number(dom.get('passPlayer').value),
        turn: dom.get('passTurn').value,
        half: dom.get('passHalf').value,
        passType: dom.get('passType').value
      }
      gameState.temporalPass = getPassRecord(params)
    }

    dom.get('passTeam').addEventListener('change', updateTempPass)
    dom.get('passPlayer').addEventListener('change', updateTempPass)
    dom.get('passType').addEventListener('change', updateTempPass)
  })();

  (() => {
    const dom = getDomNodesByIds([
      'winningsFanFactorResultTeam1',
      'winningsFanFactorResultTeam2',
    ])

    window.updateFanFactorTeam1 = function(newValue) {
      if (newValue > 0) {
        let newFame = gameState.team1.fame
        if (gameState.team1.fame < newValue) {
          newFame = gameState.team1.fame + 1
          dom.get('winningsFanFactorResultTeam1').innerHTML = `Fama +1`
        } else if (gameState.team1.fame > newValue) {
          newFame = gameState.team1.fame - 1
          dom.get('winningsFanFactorResultTeam1').innerHTML = `Fama -1`
        } else {
          dom.get('winningsFanFactorResultTeam1').innerHTML = `Se mantiene la misma Fama`
        }
        gameState.team1.newFame = newFame
      } else {
        dom.get('winningsFanFactorResultTeam1').innerHTML = ''
      }
    }

    window.updateFanFactorTeam2 = function(newValue) {
      if (newValue > 0) {
        let newFame = gameState.team2.fame
        if (gameState.team2.fame < newValue) {
          newFame = gameState.team2.fame + 1
          dom.get('winningsFanFactorResultTeam2').innerHTML = `Fama +1`
        } else if (gameState.team2.fame > newValue) {
          newFame = gameState.team2.fame - 1
          dom.get('winningsFanFactorResultTeam2').innerHTML = `Fama -1`
        } else {
          dom.get('winningsFanFactorResultTeam2').innerHTML = `Se mantiene la misma Fama`
        }
        gameState.team1.newFame = newFame
      } else {
        dom.get('winningsFanFactorResultTeam2').innerHTML = ''
      }
    }

  })()
}

export {
  initPlayListeners
}