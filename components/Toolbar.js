const Nanocomponent = require('nanocomponent');
let html = require('nanohtml');

class Toolbar extends Nanocomponent {
    constructor() {
        super();
        this.active = null;
    }

    createElement(active) {
        console.log(active);
        this.active = active;
        let c = active ? "tool-active" : "tool-passive" 
        return html`
            <div class="toolbar ${c}">

            </div>
        `
    }

    update(active) {
        return this.active !== active;
    }
}

module.exports = Toolbar;