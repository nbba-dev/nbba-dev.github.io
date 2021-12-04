const dom = new Map()
const domIds = [
  'fanFactorTeam1',
  'fansRollTeam1',
  'fanFactorTeam2',
  'fansRollTeam2',
  'resultFansTeam1',
  'resultFansTeam2',
]

const addDomNodesByIds = ((ids) => {
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
})(domIds)

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

console.log(dom.get('fanFactorTeam1').value)
dom.get('fanFactorTeam1').addEventListener('change', updateFameTeam1)
dom.get('fansRollTeam1').addEventListener('change', updateFameTeam1)
dom.get('fanFactorTeam2').addEventListener('change', updateFameTeam2)
dom.get('fansRollTeam2').addEventListener('change', updateFameTeam2)

