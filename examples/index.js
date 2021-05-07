const template = document.createElement('template');
const animationSpeed = 1000;
const Colors = {
    offWhite: '#f1f1f1',
    grayLight: '#e6e6e6',
};
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
      transition: transform ${animationSpeed}ms;
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
      transition: height ${animationSpeed / 2}ms;
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
const makeHTML = ({ elements }) => elements.map((element) => {
    if (element.hasAttribute('aria-hidden') && element.nodeName === 'DIV') {
        const wrapper = document.createElement('div');
        wrapper.classList.add('size');
        wrapper.innerHTML = element.innerHTML;
        element.innerHTML = '';
        element.appendChild(wrapper);
        return element;
    }
    return element;
});
const debounce = function (cb, wait = 50) {
    let h = 0;
    let callable = (...args) => {
        clearTimeout(h);
        h = setTimeout(() => cb(...args), wait);
    };
    return callable;
};
export default class AccordionElement extends HTMLElement {
    constructor() {
        super();
        const elements = Array.from(this.children);
        const children = makeHTML({ elements });
        this._shadow = this.attachShadow({ mode: 'open' });
        this._shadow.append(...children);
        this._shadow.appendChild(template.content.cloneNode(true));
        const containers = Array.from(this._shadow.querySelectorAll('div[aria-hidden]'));
        const buttons = Array.from(this._shadow.querySelectorAll('button'));
        buttons.forEach((button) => button.addEventListener('click', () => this.eventClick(button)));
        window.addEventListener('resize', debounce(() => this.eventResize({ elements: containers })));
    }
    eventClick(button) {
        const id = button.getAttribute('aria-controls');
        if (id) {
            const element = this._shadow.querySelector(`#${id}`);
            if (element) {
                const isOpen = element.getAttribute('aria-hidden') === 'false';
                isOpen
                    ? this.setStateClose({ button, element })
                    : this.setStateOpen({ button, element });
            }
        }
    }
    eventResize({ elements }) {
        elements.forEach((element) => {
            if (element.getAttribute('aria-hidden') === 'false') {
                const child = element.querySelector('.size');
                if (child) {
                    element.style.height = `${child.offsetHeight}px`;
                    element.style.transition = `none`;
                }
            }
        });
    }
    setStateOpen({ button, element }) {
        const sizeElement = element.querySelector('.size');
        if (sizeElement) {
            sizeElement.style.display = 'block';
            setTimeout(() => {
                element.style.height = `${sizeElement.offsetHeight}px`;
                button.setAttribute('data-active', 'true');
                element.setAttribute('aria-hidden', 'false');
            }, 100);
        }
    }
    setStateClose({ button, element }) {
        const sizeElement = element.querySelector('.size');
        button.setAttribute('data-active', 'false');
        element.setAttribute('aria-hidden', 'true');
        element.style.height = `0`;
        if (sizeElement) {
            setTimeout(() => {
                sizeElement.style.display = 'none';
            }, animationSpeed);
        }
    }
}
if (!window.customElements.get('umd-accordion')) {
    window.AccordionElement = AccordionElement;
    window.customElements.define('umd-accordion', AccordionElement);
}
//# sourceMappingURL=index.js.map