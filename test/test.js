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

let truthy = true

setTimeout(() => {
  document.documentElement.style.setProperty('--translateX', `${0}`);
  document.documentElement.style.setProperty('--rotateX', `${0}deg`);
  document.documentElement.style.setProperty('--rotateY', `${0}deg`);
  document.documentElement.style.setProperty('--rotateZ', `${0}deg`);

  // setInterval(() => {
  //   truthy = !truthy
  //   document.documentElement.style.setProperty('--translateY', `${truthy ? 10 : -10}px`);
  //   document.documentElement.style.setProperty('--rotateZ', `${truthy ? 10 : -10}deg`);
  // }, 1000)

}, 1000)

// start()

document.querySelector('#button').addEventListener('click', function () {
  document.querySelector('#display_blank').classList.toggle('hidden');
  document.querySelector('#display_browser').classList.toggle('hidden');
});