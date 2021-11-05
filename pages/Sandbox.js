let html = require('choo/html');
let choo = require('choo');

let BackButton = require('../components/BackButton.js');

let backButton = new BackButton();

function sandbox() {
    return html`
        <div class="detail-page">
            <div class="quarter">
                ${backButton.render()}

                <div class="header">
                    <div class="title">
                        Sandbox
                    </div>
                    <div class="subtitle">
                        Projects in progress, prototypes, & more?????
                    </div>
                </div>
                
                <div>
                    <ul>
                        <li><a href="https://github.com/advino/arena-blog">Arena Blog</a></li>
                        <li><a href="https://github.com/advino/album-art-recommendation">Album Artwork Recommender</a></li>
                        <li><a href="https://github.com/advino/text2UI">Text2UI</a></li>
                    </ul>
                </div>
            </div>
        </div>
    `
}

module.exports = sandbox;