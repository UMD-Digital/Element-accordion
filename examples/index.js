const template = document.createElement('template');
const openingAnimationSpeed = 1000;
const closingAnimationSpeed = openingAnimationSpeed / 2;
const Colors = {
    offWhite: '#f1f1f1',
    grayLight: '#e6e6e6',
    grayDark: '#454545',
};
template.innerHTML = `
  <style>
  
    umd-accordion {
      display: block;
    }

    ::slotted(button) {
      border: none !important;
      padding: 18px 15px !important;
      background-color: ${Colors.offWhite} !important;
      display: block !important;
      width: 100% !important;
      text-align: left !important;
      line-height: 1em !important;
      font-weight: 600 !important;
      position: relative !important;
      padding-right: 30px !important;
      border-bottom: 1px solid ${Colors.grayLight} !important;
      cursor: pointer !important;
      color:  ${Colors.grayDark} !important;
    }

    ::slotted(button:disabled) {
      cursor: inherit !important;
      opacity: .8;
      border-bottom: none !important;
    }
  
    ::slotted(button):last-of-type {
      border-bottom: 0 !important;
    }
    
    ::slotted(button[data-active]):after {
      content: '';
      position: absolute;
      top: 50%;
      right: 20px;
      margin-top: -3px;
      border-top: 7px solid black;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      transition: transform ${openingAnimationSpeed}ms;
    }
    
    ::slotted(button[data-active='true']) {
      border-bottom: none;
    }

    ::slotted(button[data-active='false']):after {
      transform: rotate(0) translateY(0);
    }
    
    ::slotted(button[data-active='true']):after {
      transform: rotate(180deg) translateY(-2px);
    }
    
    ::slotted(div[aria-hidden]) {
      display: block !important;
      overflow: hidden !important;
      height: 0;
      transition: height ${closingAnimationSpeed}ms;
    }

    ::slotted(div[aria-hidden]:not(:last-of-type)) {
      border-bottom: 1px solid ${Colors.grayLight} !important;
    }
    
  </style>
  <slot></slot>
`;
const isOpen = ({ element }) => element.getAttribute('aria-hidden') === 'false';
const disableButton = ({ button, isOpening, }) => {
    const animationSpeed = isOpening
        ? closingAnimationSpeed
        : openingAnimationSpeed;
    button.setAttribute('disabled', 'true');
    setTimeout(() => {
        button.removeAttribute('disabled');
    }, animationSpeed);
};
const makeContainerMarkup = ({ element }) => {
    if (element.hasAttribute('aria-hidden') && element.nodeName === 'DIV') {
        const wrapper = document.createElement('div');
        wrapper.classList.add('size');
        wrapper.style.display = 'none';
        wrapper.style.padding = '20px 10px';
        wrapper.innerHTML = element.innerHTML;
        element.innerHTML = '';
        element.appendChild(wrapper);
    }
};
const makeButtonMarkup = ({ button }) => {
    const span = document.createElement('span');
    span.style.whiteSpace = 'nowrap';
    span.style.textOverflow = 'ellipsis';
    span.style.width = 'calc(100% - 40px)';
    span.style.display = 'block';
    span.style.overflow = 'hidden';
    span.innerHTML = button.innerHTML;
    button.innerHTML = '';
    button.appendChild(span);
};
const removeAnimation = ({ element, button }) => {
    button.style.transition = 'none';
    element.style.transition = 'none';
    setTimeout(() => {
        button.style.removeProperty('transition');
        element.style.removeProperty('transition');
    }, openingAnimationSpeed);
};
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
        this._shadow = this.attachShadow({ mode: 'open' });
        this._shadow.appendChild(template.content.cloneNode(true));
        const containers = Array.from(this._shadow.host.querySelectorAll('div[aria-hidden]'));
        const buttons = Array.from(this._shadow.host.querySelectorAll('button'));
        containers.forEach((element) => {
            makeContainerMarkup({ element });
            if (element.getAttribute('aria-hidden') === 'false') {
                const elementButton = buttons.find((button) => button.getAttribute('id') === element.getAttribute('aria-controls'));
                console.log(elementButton);
                if (elementButton)
                    this.setStateOpen({
                        element,
                        button: elementButton,
                        includeAnimation: false,
                    });
            }
        });
        buttons.forEach((button) => {
            makeButtonMarkup({ button });
            button.addEventListener('click', () => this.eventClick(button));
        });
        window.addEventListener('resize', debounce(() => this.eventResize({ elements: containers })));
    }
    eventClick(button) {
        const id = button.getAttribute('aria-controls');
        if (id) {
            const element = this._shadow.host.querySelector(`#${id}`);
            const isOpening = isOpen({ element });
            if (element) {
                disableButton({ button, isOpening });
                isOpening
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
    setStateOpen({ button, element, includeAnimation = true }) {
        const sizeElement = element.querySelector('.size');
        if (sizeElement) {
            sizeElement.style.display = 'block';
            if (!includeAnimation)
                removeAnimation({ element, button });
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
            }, closingAnimationSpeed);
        }
    }
}
if (!window.customElements.get('umd-accordion')) {
    window.AccordionElement = AccordionElement;
    window.customElements.define('umd-accordion', AccordionElement);
}
//# sourceMappingURL=index.js.map