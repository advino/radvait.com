import html from 'choo/html';
import Toolbar from '../components/Toolbar.js';
import Tabs from '../components/Tabs.js';

let toolbar = new Toolbar();
let tabs = new Tabs();

function home(state, emit) {
    let currentTab = (state && state.activeTab) || 'experience';

    function setTab(tab) {
        if (emit) {
            emit('setTab', tab);
        } else {
            tabs.activeTab = tab;
            tabs.rerender();
        }
    }

    return html`
    <div class="max">
    <div class="quarter">
        <span class="title"><span class="title" style="font-family: 'PPMori'; font-weight: 400; opacity: .6;">(R)</span>Advait</span>
    </div>

    <div class="quarter">
        <span class="text">
        I lead interaction design and model behavior for Gemini's Living Room Agent.
        </span>

        <span class="text">
        I have shipped 0 to 1 products for ambitious opportunities across Google including Gemini, Ads, and Android
        </span>

    </div>

    <div class="quarter">
        ${tabs.render(currentTab, setTab)}
    </div>

    ${toolbar.render(state ? state.toolbar : (this && this.state && this.state.toolbar))}
        
    </div>
    `
}

export default home;