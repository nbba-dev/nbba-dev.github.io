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

const hide = (node) => {
  node.setAttribute('hidden', true)
}

const show = (node) => {
  node.removeAttribute('hidden')
}