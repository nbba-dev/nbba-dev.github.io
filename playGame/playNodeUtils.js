import { createOption, removeChildren } from '../shared/nodeUtils.js'
import { getTeamName } from './playUtils.js'

const setTeamsAsOptionsForSelect = function(selectNode) {
  removeChildren(selectNode)
  const teamIds = [1, 2]
  teamIds.forEach((teamId) => {
    selectNode.appendChild(createOption(getTeamName(teamId), teamId))
  })
}

export { setTeamsAsOptionsForSelect }