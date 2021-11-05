let html = require('choo/html');
let choo = require('choo');


let Home = require('./pages/Home.js');
let Groupdraw = require('./pages/GroupDraw.js');
let Hypercore = require('./pages/Hypercore.js');
let About = require('./pages/About.js');
let Sandbox = require('./pages/Sandbox.js');

let app = choo();
app.use(state);
app.route('/', Home);
app.route('/hypercore', Hypercore);
app.route('/sandbox', Sandbox);
app.route('/about', About);
app.route('/groupdraw', Groupdraw);


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


app.mount('div');

