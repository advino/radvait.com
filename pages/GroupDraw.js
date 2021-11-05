let html = require('choo/html');
let choo = require('choo');

let BackButton = require('../components/BackButton.js');

let backButton = new BackButton();

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

module.exports = groupdraw;