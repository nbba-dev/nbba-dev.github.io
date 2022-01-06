const initLogin = function(loggedInCallback) {

  let resolveDeferred = () => {}
  let rejectDeferred = () => {}

  let lastLoggedInStatus;

  const loadedGapiPromise = new Promise((resolve, reject) => {
    resolveDeferred = resolve
    rejectDeferred = reject
  })

  fetch("/components/nbba-login/nbba-login.html")
  .then(stream => stream.text())
  .then(text => define(text));

  // Client ID and API key from the Developer Console
  var CLIENT_ID = '673474108161-nr43igs2gi8j9nbu6pjnuuc620j45ana.apps.googleusercontent.com';
  var API_KEY = 'AIzaSyCJYgfijMbwroLQX1qBd51rx9UHDgnVrh8';

  // Array of API discovery doc URLs for APIs used by the quickstart
  var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

  // Authorization scopes required by the API; multiple scopes can be
  // included, separated by spaces.
  var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

  function define(html) {
    class NbbaLogin extends HTMLElement {
      constructor() {
        super();

        var shadow = this.attachShadow({mode: 'open'});
        shadow.innerHTML = html;

        this.loginButton = shadow.querySelector('#nbba-login-btn');
        this.logoutButton = shadow.querySelector('#nbba-logout-btn');
        this.text = shadow.querySelector('#nbba-login-status');

        if (this.dataset.noLogout === 'true') {
          this.logoutButton.setAttribute('hidden', true)
        }

        var script = document.createElement('script');
        script.setAttribute('async', true)
        script.setAttribute('defer', true)
        script.onload = () => { gapi.load('client:auth2', () => { this.initClient() }); }
        script.onreadystatechange = () => { debugger; if (this.readyState === 'complete') this.onload() }
        script.src = "https://apis.google.com/js/api.js";
        document.getElementsByTagName('head')[0].appendChild(script);
      }

      login() {
        gapi.auth2.getAuthInstance().signIn();
      }

      logout() {
        let r = confirm("¿Seguro que quieres hacer logout?");
        if (r == true) {
          gapi.auth2.getAuthInstance().signOut();
        }
      }

      initClient() {
        gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        }).then(() => {
          // Listen for sign-in state changes.
          gapi.auth2.getAuthInstance().isSignedIn.listen((a) => { this.updateSigninStatus(a) });

          // Handle the initial sign-in state.
          this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

          this.loginButton.addEventListener('click', this.login)
          this.logoutButton.addEventListener('click', this.logout)

          resolveDeferred()
        }, function(error) {
          alert(JSON.stringify(error, null, 2))
          rejectDeferred()
        });
      }

      updateSigninStatus(isLoggedIn) {
        if (isLoggedIn) {
          this.loginButton.setAttribute('hidden', true)
          if (this.dataset.noLogout !== 'true') {
            this.logoutButton.removeAttribute('hidden')
          }
        } else {
          this.loginButton.removeAttribute('hidden')
          this.logoutButton.setAttribute('hidden', true)
        }
        if (isLoggedIn === false && lastLoggedInStatus === true) {
          window.location.reload()
        }
        lastLoggedInStatus = isLoggedIn
        loggedInCallback && loggedInCallback(isLoggedIn)
      }
    }

    customElements.define('nbba-login', NbbaLogin);
  }

  return loadedGapiPromise
}


export {
  initLogin,
}