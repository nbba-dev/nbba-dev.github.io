fetch("/components/nbba-header/nbba-header.html")
.then(stream => stream.text())
.then(text => define(text));

function define(html) {
  class NbbaHeader extends HTMLElement {
    constructor() {
      super();

      var shadow = this.attachShadow({mode: 'open'});
      shadow.innerHTML = html;
    }
  }
  customElements.define('nbba-header', NbbaHeader);
}