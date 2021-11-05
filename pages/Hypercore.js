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
            </div>

            <div class="threequarter documentation">

            </div>
        </div>

    `
}

module.exports = hypercore;