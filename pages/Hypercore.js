let html = require('choo/html');
let choo = require('choo');

let BackButton = require('../components/BackButton.js');

let backButton = new BackButton();

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

                <div>
                    <span class="subtitle">
                        <a href="https://www.github.com/advino/hellohypercore">Hello Hypercore <span class="nearrow"></span></a>
                    </span>
                    <span class="text">
                        Implementation of the Hypercore object which is essenitally a single-writer ledger that is synced across a set of nodes on a network.
                    </span>
                </div>

                <div>
                    <span class="subtitle">
                        <a href="https://www.github.com/advino/hellohyperdrive">Hello Hyperdrive <span class="nearrow"></span></a>
                    </span>
                    <span class="text">
                        Syncs a single folder across a set of nodes on a network. It is basically a more vanilla version of Dat-folder.
                    </span>
                </div>

                <div>
                    <span class="subtitle">
                    <a href="https://www.github.com/advino/hyperjankstate">Hello HyperJank State <span class="nearrow"></span></a>
                    </span>
                    <span class="text">
                        Simple state machine crossed with the Hypercore object. A state machine's current state is synced across a set of nodes' state machines on the network.
                    </span>
                </div>
            </div>

            <div class="threequarter documentation">

            </div>
        </div>

    `
}

module.exports = hypercore;