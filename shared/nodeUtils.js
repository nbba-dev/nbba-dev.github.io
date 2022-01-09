const createA = function(text, href) {
  const node = document.createElement('a');
  const textNode = document.createTextNode(text);
  node.appendChild(textNode);
  node.title = text;
  node.href = href;
  node.target = '_blank'
  return node;
}

const createButton = function(text) {
  const node = document.createElement("button");
  const textNode = document.createTextNode(text);
  node.appendChild(textNode);
  node.title = text;
  node.type = "submit";
  return node;
}

const createButtonInnerHtml = function(content, onclickFn) {
  const node = document.createElement("button");
  // let textNode = []
  // textNode.push(document.createTextNode(content))
  // textNode.forEach((textNode) => {
  //   node.appendChild(textNode);
  // })
  node.innerHTML = content
  node.onclick = onclickFn
  return node;
}

const removeChildren = function(node) {
  while (node.firstChild) {
    node.removeChild(node.lastChild);
  }
}

const createOption = function(text, value) {
  const node = document.createElement("option");
  const textNode = document.createTextNode(text);
  node.appendChild(textNode);
  node.title = text;
  node.value = value;
  return node;
  // <option value="0" selected>Equipo Local</option>
}

const createImg = function(path) {
  const node = document.createElement("img");
  node.src = path;
  return node;
}

export {
  createA,
  createButton,
  removeChildren,
  createOption,
  createImg,
  createButtonInnerHtml,
}