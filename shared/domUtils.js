const getDomNodesByIds = (ids) => {
  const dom = new Map()
  ids.forEach((id) => {
    const nodes = [...document.querySelectorAll(`#${id}`)]
    if (nodes.length === 0) {
      console.error('Error document.queryselecting on', id)
    }
    else if (nodes.length === 1) {
      dom.set(id, nodes[0])
    } else {
      dom.set(id, nodes)
    }
  })
  return dom
};

const hide = (node) => {
  node.setAttribute('hidden', true)
}

const show = (node) => {
  node.removeAttribute('hidden')
}

const getDomArr = (ids) => {
  const domArr = []
  ids.forEach((id) => {
    domArr.push(document.querySelector(`#${id}`))
  })
  return domArr
}

export {
  getDomNodesByIds,
  hide,
  show,
  getDomArr,
}