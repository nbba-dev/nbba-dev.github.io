document.querySelector('#button').addEventListener('click', function () {
  document.querySelector('#display_blank').classList.toggle('hidden');
  document.querySelector('#display_browser').classList.toggle('hidden');
});

const intersectionRatio = 0.6
const phone1 = document.querySelector('#smartphone1')
const phone2 = document.querySelector('#smartphone2')
const phone3 = document.querySelector('#smartphone3')
const phone4 = document.querySelector('#smartphone4')

const enteredViewDict = {
  homeSection1: () => {
  },
  homeSection4: () => {
    phone3.style.setProperty('--translateX', `calc(-1 * var(--phoneWidth) + 50vw)`);
    phone3.style.setProperty('--translateY', `calc(45vh - 150px)`);
    phone3.style.setProperty('--rotateX', `${0}deg`);
    phone3.style.setProperty('--rotateY', `${0}deg`);
    phone3.style.setProperty('--rotateZ', `${0}deg`);
    phone3.style.setProperty('--transitionSpeed', `${0.6}s`);
    startHoverSmartphone(phone3)
  },
  homeSection5: () => {
    phone4.style.setProperty('--translateX', `calc(50vw)`);
    phone4.style.setProperty('--translateY', `calc(45vh - 150px)`);
    phone4.style.setProperty('--rotateX', `${0}deg`);
    phone4.style.setProperty('--rotateY', `${0}deg`);
    phone4.style.setProperty('--rotateZ', `${0}deg`);
    phone4.style.setProperty('--transitionSpeed', `${0.6}s`);
    startHoverSmartphone(phone4)
  },
  homeSection2: () => {
    phone1.style.setProperty('--translateX', `calc(-1 * var(--phoneWidth) + 50vw)`);
    phone1.style.setProperty('--translateY', `calc(45vh - 150px)`);
    phone1.style.setProperty('--rotateX', `${0}deg`);
    phone1.style.setProperty('--rotateY', `${0}deg`);
    phone1.style.setProperty('--rotateZ', `${90}deg`);
    phone1.style.setProperty('--transitionSpeed', `${0.6}s`);
    startHoverSmartphone(phone1)
  },
  homeSection3: () => {
    phone2.style.setProperty('--translateX', `calc(50vw)`);
    phone2.style.setProperty('--translateY', `calc(45vh - 150px)`);
    phone2.style.setProperty('--rotateX', `${0}deg`);
    phone2.style.setProperty('--rotateY', `${0}deg`);
    phone2.style.setProperty('--rotateZ', `${90}deg`);
    phone2.style.setProperty('--transitionSpeed', `${0.6}s`);
    startHoverSmartphone(phone2)
  },
}
const leftViewDict = {
  homeSection1: () => {
    // console.log('out', 0)
  },
  homeSection2: () => {
    // console.log('out', 1)
  },
  homeSection3: () => {
    // console.log('out', 2)
  },
  homeSection4: () => {
    // console.log('out', 3)
  },
  homeSection5: () => {
    // console.log('out', 3)
  },
}

const intersectionObserverCallback = function(entries, observer) {
  entries.forEach(entry => {
    if (entry.intersectionRatio > intersectionRatio) {
      enteredViewDict[entry.target.id]?.()
    } else  {
      leftViewDict[entry.target.id]?.()
    }
  });
};


let intersectionObserverOptions = {
  root: document,
  rootMargin: '0px',
  threshold: intersectionRatio
}

let observer = new IntersectionObserver(intersectionObserverCallback, intersectionObserverOptions);

observer.observe(document.querySelector('#homeSection1'));
observer.observe(document.querySelector('#homeSection2'));
observer.observe(document.querySelector('#homeSection3'));
observer.observe(document.querySelector('#homeSection4'));
observer.observe(document.querySelector('#homeSection5'));
observer.observe(document.querySelector('#homeSection6'));

const limitIterations = 10

function startHoverSmartphone(phone) {
  let goingUp = true
  let iterations = 0

  const hoverSmartphone = function() {
    phone.style.setProperty('--rotateY', goingUp ? '5deg' : '-5deg');
    phone.style.setProperty('--rotateX', goingUp ? '5deg' : '-5deg');
    phone.style.setProperty('--translateY', goingUp ? 'calc(150px + 60% + 5px)' : 'calc(150px + 60% - 10px)');
    phone.style.setProperty('--transitionSpeed', `${3}s`);
    phone.style.setProperty('--transitionTiming', `ease-in-out`);
  }

  setTimeout(hoverSmartphone, 600)

  const smartphone3Interval = setInterval(() => {
    goingUp = !goingUp
    iterations += 1
    hoverSmartphone()
    if (iterations > limitIterations) {
      clearInterval(smartphone3Interval)
    }
  }, 3000)
}


document.querySelector('#playGame').addEventListener('click', () => {
  window.open('/gameSetup', '_self')
})

document.querySelector('#playLeagueGame').addEventListener('click', () => {
  window.open('/leagueGameSetup', '_self')
})
