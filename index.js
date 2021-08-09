let html = require('choo/html');
let choo = require('choo');
let Toolbar = require('./components/Toolbar.js');
let BackButton = require('./components/BackButton.js');

let app = choo();
app.use(state);
app.route('/', home);
app.route('/hypercore', hypercore);
app.route('/sandbox', sandbox);
app.route('/about', about);
app.route('/groupdraw', groupdraw);


let toolbar = new Toolbar();
let backButton = new BackButton();

// No longer needed since compiling with Browserify
// let groupDrawImages = require('url:/assets/groupdraw/ui.png'); 


function state(state, emitter) {
    state.toolbar = false;
    state.nightmode = false;
    emitter.on('DOMContentLoaded', () => {
        emitter.on('toggle', data => {
            if (data == 'n') {
                state.nightmode = !state.nightmode;
                document.body.className = state.nightmode ? "night" : "day";
            }

            if (data == '?') {
                state.toolbar = !state.toolbar;
            }

            emitter.emit('render');
        });

        window.addEventListener('keypress', e => {
            emitter.emit('toggle', e.key);
        });
    })
}

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
        </ul>
    </div>

    ${toolbar.render(this.state.toolbar)}
        
    </div>
    `
}

function groupdraw() {
    return html`
        <div class="detail-page max">

            <div class="quarter">
                ${backButton.render()}
                <div class="header">
                    <div class="title">
                        Groupdraw
                    </div>
                    <div class="subtitle">
                        Simple, Shared, Software
                    </div>
                </div>

                <div>
                    <span class="text">
                    Groupdraw is a small experiment in shared-ownership. 
                    <br>
                    <br>
                    Most software today operates on an <i>all in one</i> modality where users have complete access to all functionality from the start. Groupdraw seeks to question this through the means of a browser-based drawing board.
                    <br>
                    <br>
                    Groupdraw restricts certain tools based on how many additional users there are sharing the network. A certain number of users must be 'seeding' or supporting the network in order for the tool to have certain functionality.
                    <br>
                    <br>
                    What if a tool's effectiveness was a function of the level of attention and support it received?
                    </span>
                </div>
            </div>

            <div class="threequarter documentation">
                <img class="documentation-image" src="./assets/groupdraw/ui.png">
            </div>
        </div>
    `
}


function hypercore() {
    return html`
        <div class="detail-page max">

            <div class="quarter">
                ${backButton.render()}
                <div class="header">

                    <div class="title">
                        Hypercore Experiements
                    </div>
                    <div class="subtitle">
                        Code Snippets & Prototypes
                    </div>
                </div>
                <div>
                    <span class="text">
                        In learning about the p2p space and the design and development of distributed applications, I have built a series of small experiements to test the capabilies and better understand the Hypercore framework.
                    </span>
                </div>
            </div>

            <div class="threequarter documentation">

            </div>
        </div>

    `
}

function sandbox() {
    return html`
        <div class="detail-page">
            <div class="quarter">
                ${backButton.render()}

                <div class="header">
                    <div class="title">
                        Sandbox
                    </div>
                    <div class="subtitle">
                        Projects in progress, prototypes, & more?????
                    </div>
                </div>
                
                <div>
                    <ul>
                        <li><a href="https://github.com/advino/arena-blog">Arena Blog</a></li>
                        <li><a href="https://github.com/advino/album-art-recommendation">Album Artwork Recommender</a></li>
                        <li><a href="https://github.com/advino/text2UI">Text2UI</a></li>
                    </ul>
                </div>
            </div>
        </div>
    `
}

function about() {
    return html`
        <div class="detail-page max">
            <div class="quarter">
                ${backButton.render()}

                <div class="header">
                    <div class="title">
                        About
                    </div>
                    <div class="subtitle">
                        Internet gunslinger. 
                    </div>
                </div>

                <div>
                    <span class="text">
                        Currently designing and building peer-to-peer objects & software. Researching connected objects, daemons, and agents that collect, maintain, and repair. Believer of the crossing of <a href="https://youtube.com/clip/UgzqNF4tAyUaxZUlpiV4AaABCQ">smart and stupid</a>.
                    </span>
                </div>

                <div>
                    <span class="text">A Brief History</span>
                    <br>
                    <br>
                    <span class="text">2019 ${"->"} Google  </span>
                    <br>
                    <span class="text">2015 ${"->"} 2019 RISD BFA Industrial Design</span>
                </div>
            </div>

            <div class="threequarter documentation">
                <img class="prof-image" src="./assets/bio/prof.png">

            </div>
        </div>
    `
}

app.mount('div');

