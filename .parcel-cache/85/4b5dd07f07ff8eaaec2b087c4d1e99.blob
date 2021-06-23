const Nanocomponent = require('nanocomponent');
let html = require('nanohtml');

class Toolbar extends Nanocomponent {
    constructor() {
        super();
        this.active = null;
    }

    createElement(active) {
        this.active = active;
        let c = this.active ? "tool-active" : "tool-passive" 
        return html`
            <div class="toolbar ${c}">
            <div style="display:flex; gap: 4px; flex-direction: column;">
                <div class="tool">
                    N
                </div>
                <div style="display:flex; justify-content: center; font-size: 12px; opacity: .71; font-family: Roboto Mono, monospace">
                    NIGHT
                </div>
            </div>
            <div style="display:flex; gap: 4px;  flex-direction: column;">
                <div class="tool">
                    ?
                </div>
                <div style="display:flex; justify-content: center; font-size: 12px; opacity: .71; font-family: Roboto Mono, monospace">
                    TOOLS
                </div>
            </div>
            <div style="display:flex; gap: 4px;  flex-direction: column;">
                <div class="tool">
                    C
                </div>
                <div style="display:flex; justify-content: center; font-size: 12px; opacity: .71; font-family: Roboto Mono, monospace">
                    CLOCK
                </div>
            </div>
            </div>
        `
    }

    update(active) {
        return this.active !== active;
    }
}

module.exports = Toolbar;