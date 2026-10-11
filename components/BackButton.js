import Nanocomponent from 'nanocomponent';
import html from 'nanohtml';

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

export default BackButton;
