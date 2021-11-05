let html = require('choo/html');
let choo = require('choo');

let BackButton = require('../components/BackButton.js');

let backButton = new BackButton();

function about() {
    return html`
        <div class="detail-page max">
            <div class="quarter">
                ${backButton.render()}

                <div class="header">
                    <div class="title">
                        About
                    </div>
                    <div class="subtitle">
                        An internet gunslinger. 
                    </div>
                </div>

                <div>
                    <span class="text">
                        I design TV & Media experiences at Google. In my personal time I have been creating peer-to-peer applications, sharping my visual design skills, and occasionally writing code for other friends projects. I am a firm believer of the crossing of <a href="https://youtube.com/clip/UgzqNF4tAyUaxZUlpiV4AaABCQ">smart and stupid</a>.
                    </span>
                </div>

                <div class="header">
                    <div class="title">Experience</div>
                    <div class="subtitle">Escapades past and current</div>
                </div>
                <div>
                    <span class="text">2019 ${"->"} Present - Google TV </span>
                    <br>
                    <span class="text">2015 ${"->"} 2019 - RISD BFA Industrial Design</span>
                </div>
            </div>

            <div class="threequarter documentation">
                <img class="prof-image" src="./assets/bio/prof.png">

            </div>
        </div>
    `
}

module.exports = about;