var i = 1;
document.querySelector('#control').addEventListener('click', function () {
  document.querySelector('.parts').classList.remove('pos' + i);
  for (var s = 1; s < 11; s++) {
    document.querySelector('#side' + s).classList.remove('side' + s + 'pos' + i);
  }
  i++;
  if (i > 4) {
    i = 1;
  }
  document.querySelector('.parts').classList.add('pos' + i);
  for (var s = 1; s < 11; s++) {
    document.querySelector('#side' + s).classList.add('side' + s + 'pos' + i);
  }
});

document.querySelector('#button').addEventListener('click', function () {
  document.querySelector('#display_blank').classList.toggle('hidden');
  document.querySelector('#display_browser').classList.toggle('hidden');
});

// setInterval(() => {
//   document.querySelector('#control').click()
// }, 2000)
