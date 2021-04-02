let html = require('choo/html');
let choo = require('choo');

let app = choo();
app.use(state);
app.route('/', home);
app.route('/hypercore', hypercore);
app.route('/other', other);


function state(state, emitter) {
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
    <div clas="full">
    <div>
        Advait Kalakkad
        <div style="opacity: .8;">
            Designer
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
</div>
    `
}

function hypercore() {
    return html`
        <div>
            <div>
                Hypercore Experiements
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
                Other works
            </div>
            <div>
                <ul>
                    <li>Album Artwork Recommender</li>
                    <li>Text2UI</li>
                </ul>
            </div>
        </div>
    `
}

app.mount('div');

function toggleNight(e) {
    if(e.key === 'n') {
        console.log('n')
        emit('toggle');
    }
}