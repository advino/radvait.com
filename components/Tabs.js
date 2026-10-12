import Nanocomponent from 'nanocomponent';
import html from 'nanohtml';
import { content } from '../store/content.js';

class Tabs extends Nanocomponent {
    constructor() {
        super();
        this.activeTab = 'experience';
        this.onSelectTab = null;
    }

    createElement(activeTab = 'experience', onSelectTab) {
        this.activeTab = activeTab;
        this.onSelectTab = onSelectTab;

        const tabKeys = Object.keys(content);
        if (!tabKeys.includes(this.activeTab) && tabKeys.length > 0) {
            this.activeTab = tabKeys[0];
        }

        return html`
            <div class="tabs-container">
                <div class="tabs-nav" role="tablist">
                    ${tabKeys.map((key, index) => {
                        const isActive = this.activeTab === key;
                        const label = key.charAt(0).toUpperCase() + key.slice(1);
                        return html`
                            ${index > 0 ? html`<span class="tab-divider">/</span>` : ''}
                            <button 
                                type="button"
                                role="tab"
                                aria-selected="${isActive}"
                                class="tab-btn ${isActive ? 'tab-btn-active' : ''}"
                                onclick=${() => this.handleClick(key)}
                            >
                                ${label}
                            </button>
                        `;
                    })}
                </div>

                <div class="tab-content" role="tabpanel">
                    ${this.renderList(content[this.activeTab] || [])}
                </div>
            </div>
        `;
    }

    handleClick(tab) {
        if (this.onSelectTab) {
            this.onSelectTab(tab);
        } else {
            this.activeTab = tab;
            this.rerender();
        }
    }

    renderList(items) {
        return html`
            <ul class="tab-list">
                ${items.map(item => html`
                    <li class="tab-list-item">
                        ${item.url
                ? html`
                                <a 
                                    href="${item.url}" 
                                    target="${item.external ? '_blank' : '_self'}" 
                                    rel="${item.external ? 'noopener noreferrer' : ''}"
                                >
                                    ${item.title}${item.external ? html` <span class="nearrow"></span>` : ''}
                                </a>
                              `
                : html`<span class="tab-item-title">${item.title}</span>`
            }
                        ${item.role ? html`<span class="tab-item-role">${item.role}</span>` : ''}
                        ${item.meta ? html`<span class="tab-item-meta">${item.meta}</span>` : ''}
                    </li>
                `)}
            </ul>
        `;
    }

    update(activeTab) {
        return this.activeTab !== activeTab;
    }
}

export default Tabs;
