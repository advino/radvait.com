import choo from 'choo';

import Home from './pages/Home.js';
import Groupdraw from './pages/GroupDraw.js';
import Hypercore from './pages/Hypercore.js';
import About from './pages/About.js';
import Sandbox from './pages/Sandbox.js';

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
    state.activeTab = 'experience';

    emitter.on('setTab', tab => {
        state.activeTab = tab;
        emitter.emit('render');
    });

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

