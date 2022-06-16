const shouldBeAbleToSkipIntro = () => {
  return new Promise((success, reject) => {
    document.querySelector('#skipGuidedMode').click()
    const isFameModalOpen = !document.querySelector('#fameModal').hasAttribute('hidden')

    if (!isFameModalOpen) {
      success()
    } else {
      reject()
    }
  })
}

const shouldBeFameModalOpen = () => {
  return new Promise((success, reject) => {
    const isFameModalOpen = !document.querySelector('#fameModal').hasAttribute('hidden')

    if (isFameModalOpen) {
      success()
    } else {
      reject()
    }
  })
}

window.testSuite1 = () => {
  const tests = [shouldBeFameModalOpen, shouldBeAbleToSkipIntro]

  tests.forEach(fn => {
    window.requestAnimationFrame(() => {
      fn().then(() => {
        console.log(`${fn.name}, OK`)
      }).catch(() => {
        console.error(`${fn.name}, KO`)
      })
    })
  })
}
