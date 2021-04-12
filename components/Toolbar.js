const Nanocomponent = require('nanocomponent');
let html = require('nanohtml');

class Toolbar extends Nanocomponent {
    constructor() {
        super();
        this.active = false;
    }

    createElement(active) {
        this.active = active;
        return html`
            <div class="toolbar ${this.active ? "tool-active" : "tool-passive"}">

            </div>
        `
    }

    update(active) {
        console.log("new active", active);
        console.log("current active", this.active);
        return active !== this.active;
    }
}

module.exports = Toolbar;