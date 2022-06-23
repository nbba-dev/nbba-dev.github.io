import { createOption, removeChildren } from '/shared/nodeUtils.js'
import { getTeamName } from '/playGame/playUtils.js'

const setTeamsAsOptionsForSelect = function(selectNode) {
  removeChildren(selectNode)
  const teamIds = [1, 2]
  teamIds.forEach((teamId) => {
    selectNode.appendChild(createOption(getTeamName(teamId), teamId))
  })
}

const setPlayersAsOptionsForSelect = function(selectNode, players) {
  removeChildren(selectNode)
  players.forEach((player) => {
    if (player.playerId) {
      selectNode.appendChild(createOption(`(${player.playerNumber}) ${player.playerName} - ${player.playerPosition}, ${player.playerValue}`, player.playerId))
    } else {
      selectNode.appendChild(createOption(`${player}`, player))
    }
  })
}

export {
  setTeamsAsOptionsForSelect,
  setPlayersAsOptionsForSelect,
}