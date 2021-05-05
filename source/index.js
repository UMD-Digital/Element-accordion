const Colors = {
    white: 'ffffff',
    offWhite: '#f1f1f1',
    black: '#000000',
    grayDark: '#454545',
    gray: '#7f7f7f',
    grayLight: '#e6e6e6',
    red: '#e21833',
    redDark: '#951022',
    gold: 'ffd200',
    yellow: '#f8d351',
    yellowDark: '#c1a43d',
    bronze: '#ad7231',
    blue: '#4070ff',
    mckeldin: '#80e653',
    patina: '#2de6c6',
    oriole: '#e68320',
};
const template = document.createElement('template');
template.innerHTML = `
  <style>
  
    umd-accordion {
      display: block;
    }
    
    button {
      border: none;
      padding: 18px 15px;
      background-color: ${Colors.offWhite};
      display: block;
      width: 100%;
      text-align: left;
      line-height: 1em;
      font-weight: 600;
      position: relative;
      padding-right: 30px;
      border-bottom: 1px solid ${Colors.grayLight};
    }
  
    button:last-of-type {
      border-bottom: 0;
    }
    
    button:after {
      content: '';
      position: absolute;
      top: 50%;
      right: 20px;
      margin-top: -3px;
      border-top: 7px solid black;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      transform: rotate(0) translateY(0);
      transition: transform 1s;
    }
    
    button[data-active='true'] {
      border-bottom: none;
    }
    
    button[data-active='true']:after {
      transform: rotate(180deg) translateY(-2px);
    }
    
    button span {
      white-space: nowrap;
      text-overflow: ellipsis;
      width: calc(100% - 40px);
      display: block;
      overflow: hidden;
    }
    
    div[aria-hidden] {
      display: block;
      overflow: hidden;
      height: 0;
      transition: height 0.5s;
    }

    div[aria-hidden]:not(:last-of-type) {
      border-bottom: 1px solid ${Colors.grayLight};
    }
    
    div[aria-hidden] > div {
      padding: 20px 10px;
      display: none;
    }
  
  </style>
    
`;
export default class AccordionElement extends HTMLElement {
    constructor() {
        super();
        this._shadow = this.attachShadow({ mode: 'open' });
        this._shadow.append(...this.children);
        const buttons = Array.from(this._shadow.querySelectorAll('button'));
        this._shadow.appendChild(template.content.cloneNode(true));
        buttons.forEach((button) => button.addEventListener('click', () => this.eventClick(button)));
    }
    eventClick(button) {
        const id = button.getAttribute('aria-controls');
        if (id) {
            const element = this._shadow.querySelector(`#${id}`);
            if (element) {
                const isOpen = element.getAttribute('aria-hidden') === 'false';
                console.log(isOpen);
                isOpen
                    ? this.setStateClose({ button, element })
                    : this.setStateOpen({ button, element });
            }
        }
    }
    setStateOpen({ button, element }) {
        const elements = Array.from(element.querySelectorAll('> *'));
        console.log(elements);
        button.setAttribute('data-active', 'true');
        element.setAttribute('aria-hidden', 'false');
    }
    setStateClose({ button, element }) {
        button.setAttribute('data-active', 'true');
        element.setAttribute('aria-hidden', 'false');
    }
}
if (!window.customElements.get('umd-accordion')) {
    window.AccordionElement = AccordionElement;
    window.customElements.define('umd-accordion', AccordionElement);
}
//# sourceMappingURL=index.js.map