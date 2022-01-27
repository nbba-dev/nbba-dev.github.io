let x = 0
let y = 0
let z = 0

const intervalFn = () => {
  x += 1
  // y += 1
  // z += 1

  document.documentElement.style.setProperty('--rotateX', `${x}deg`);
  // document.documentElement.style.setProperty('--rotateY', `${y}deg`);
  // document.documentElement.style.setProperty('--rotateZ', `${z}deg`);
}

const stop = () => {
  clearInterval(interval)
}

const start = () => {
  interval = setInterval(intervalFn, 10)
}

start()