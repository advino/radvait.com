let html = require('choo/html');
let choo = require('choo');

let app = choo();
app.route('/', home);
app.route('/hypercore', hypercore);

function home() {
    return html`
    <body>
    <div>
        Advait Kalakkad
    </div>
    <div>
        <div>
            Selected Works
        </div>
        <ul>
            <li><a href="https://mixedsignals.studio" >Mixed Signals Studio</a></li>
            <li><a href="/hypercore">Hypercore Experiments</a></li>
            <li>Other works</li>
            <li><a href="https://are.na/advait-kalakkad/">Are.na</a></li>
            </ul>
            </div>
    <div>
        Designer by day, internet gunslinger by night.
    </div>
</body>
    `
}

function hypercore() {
    return html`
        <body>
            <div>
                Hypercore Experiements
            </div>
            <div>
                In learning about the p2p space and the design and development of distributed applications, I have built a series of small experiements to test the capabilies and better understand the Hypercore framework.
            </div>

        </body>

    `
}

app.mount('body');