const Nanocomponent = require('nanocomponent');
let html = require('nanohtml');

class BackButton extends Nanocomponent {

    constructor() {
        super();
    }

    createElement() {
        return html`
            <a class="back-nav" href="/">${"<-"}</a>
        `
    }

    update() {
        return false;
    }
}

module.exports = BackButton;
