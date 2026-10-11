import html from 'choo/html';
import Toolbar from '../components/Toolbar.js';

let toolbar = new Toolbar();

function home() {
    return html`
    <div class="max">
    <div class="quarter">
        <span class="title"><span class="title" style="opacity: .6;">(r)</span>Advait</span>
    </div>

    <div class="quarter">
        <span style="font-family: 'Inter'; font-weight: 300; line-height: 26px;">
        I lead multi-modal interaction design and model behavior for Gemini's Living Room Agent.
        <br>
        <br>
        I have designed and shipped 0 - 1 products for ambitious opportunties across <a href="https://blog.google/products-and-platforms/platforms/google-tv/new-gemini-features-march-2026/">Gemini</a>, <a href="https://tv.google/intl/en_us/">Android</a>, and Google Ads.
        </span>

    </div>

    <div class="quarter">

    </div>

    ${toolbar.render(this.state.toolbar)}
        
    </div>
    `
}

export default home;