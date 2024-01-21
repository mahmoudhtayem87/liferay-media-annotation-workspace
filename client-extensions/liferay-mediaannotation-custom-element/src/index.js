import {createRoot} from 'react-dom/client';

import './index.css';
import App from './App';

class WebComponent extends HTMLElement {
    connectedCallback() {
        this.root = createRoot(this);

        this.root.render(<App route={this.getAttribute('route')} />, this);
    }
    disconnectedCallback() {
        this.root.unmount();

        delete this.root;
    }
}

const ELEMENT_ID = 'liferay-mediaannotation-custom-element';

if (!customElements.get(ELEMENT_ID)) {
    customElements.define(ELEMENT_ID, WebComponent);
}
