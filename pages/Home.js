let html = require('choo/html');
let choo = require('choo');
let Toolbar = require('../components/Toolbar');

let toolbar = new Toolbar();

function home() {
    return html`
    <div class="max">
    <div class="header">
        <div class="title" style="display:flex; align-items:center; gap: 12px;">
            <span>Advait Kalakkad</span> <span class="badge">SITE WIP</span>
        </div>
        <div class="subtitle">
            Designer & Technologist
        </div>
    </div>

    <div class="quarter">
        <ul>
            <li>Selected Works</li>
            <li>--------------</li>
            <li><a href="/groupdraw">Groupdraw</a></li>
            <li><a href="https://mixedsignals.studio" >Mixed Signals Studio <span class="nearrow"></span></a></li>
            <li><a href="/hypercore">Hypercore Experiments</a></li>
            <li><a href="/sandbox">Sandbox</a></li>
        </ul>
        <ul>
            <li>Links</li>
            <li>--------------</li>
            <li><a href="/about">About</a></li>
            <li><a href="https://are.na/advait-kalakkad/">Are.na <span class="nearrow"></span></a></li>
            <li><a href="https://github.com/advino/">Github <span class="nearrow"></span></a></li>
            <li><a href="https://read.cv/radvait">Read CV<span class="nearrow"></span></a></li>
        </ul>
    </div>

    ${toolbar.render(this.state.toolbar)}
        
    </div>
    `
}


module.exports = home;