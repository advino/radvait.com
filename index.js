let html = require('choo/html');
let choo = require('choo');
let Toolbar = require('./components/Toolbar.js');


let app = choo();
app.use(state);
app.route('/', home);
app.route('/hypercore', hypercore);
app.route('/other', other);
app.route('/about', about); 

function state(state, emitter) {
    state.toolbar = true;
    state.nightmode = false;
    emitter.on('DOMContentLoaded', () => {
        emitter.on('toggle', data => {
            if(data == 'n') {
                state.nightmode = !state.nightmode;
                document.body.className = state.nightmode ? "night" : "day";
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
    <div>
        Advait Kalakkad
        <div class="subtitle">
            Designer + Technologist
        </div>
    </div>
    <div>
        <ul>
            <li>Projects</li>
            <li>--------------</li>
            <li><a href="https://mixedsignals.studio" >Mixed Signals Studio</a></li>
            <li><a href="/hypercore">Hypercore Experiments</a></li>
            <li><a href="/other" >Other works</a></li>
        </ul>
        <ul>
            <li>Links</li>
            <li>--------------</li>
            <li><a href="https://are.na/advait-kalakkad/">Are.na</a></li>
            <li><a href="https://github.com/advino/">Github</a></li>
        </ul>
    </div>
    <div>
        Designer by day ☀
        <br>
        Internet gunslinger by night ☾
    </div>
    <br>
    <div>
        <a href="/about">More about me</a>
    </div>

</div>
    `
}

function hypercore() {
    return html`
        <div>
            <div>
            <a href="/"> ← </a> Hypercore Experiements
            <div class="subtitle">
                Code Snippets & Prototypes
            </div>
            </div>
            <div class="half">
                In learning about the p2p space and the design and development of distributed applications, I have built a series of small experiements to test the capabilies and better understand the Hypercore framework.
            </div>

        </div>

    `
}

function other() {
    return html`
        <div>
            <div>
            <a href="/"> ← </a> Other works
            </div>
            <div>
                <br>
                Things I've built, random ideas, works-in-progess??
                <ul>
                    <li><a href="https://github.com/advino/arena-blog">Arena Blog</a></li>
                    <li><a href="https://github.com/advino/album-art-recommendation">Album Artwork Recommender</a></li>
                    <li><a href="https://github.com/advino/text2UI">Text2UI</a></li>
                </ul>
            </div>
        </div>
    `
}

function about() {
    return html`
        <div>
            <div>
                <a href="/"> ← </a> About
            </div>
            <div class="half">
                Google [Current] → RISD ID [2015-2019]
                <div>
                <br>
                    Hit me up if you're trying to build cool shit. 
                    <br>
                    I offer development, prototyping, and consulting services on the following
                    <ul>
                        <li>Front-end dev</li>
                        <li>Physical Computing</li>
                        <li>Networked objects</li>
                    </ul>

                    Contact me at advait.kalakkad@gmail.com
                </div>
            </div>

        </div>
    `
}

app.mount('div');