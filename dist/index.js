const ACTIVE_ATTR = 'data-active';
const THEME_ATTR = 'theme';
const ARIA_HIDDEN_ATTR = 'aria-hidden';
const ARIA_CONTROLS_ATTR = 'aria-controls';
const SIZE_CLASS = '.size';
const CHEVRON_CLASS = '.chevron';
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
    
    ::slotted(button[${ACTIVE_ATTR}='true']) {
      border-bottom: none;
    }
    
    ::slotted(div[${ARIA_HIDDEN_ATTR}]) {
      display: block !important;
      overflow: hidden !important;
      height: 0;
      transition: height ${closingAnimationSpeed}ms;
    }

    ::slotted(div[${ARIA_HIDDEN_ATTR}]:not(:last-of-type)) {
      border-bottom: 1px solid ${Colors.grayLight} !important;
    }
    
  </style>
  <slot></slot>
`;
const isOpen = ({ element }) => element.getAttribute(ARIA_HIDDEN_ATTR) === 'false';
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
    if (element.hasAttribute(ARIA_HIDDEN_ATTR) && element.nodeName === 'DIV') {
        const wrapper = document.createElement('div');
        wrapper.classList.add(SIZE_CLASS.substr(1, SIZE_CLASS.length - 1));
        wrapper.style.display = 'none';
        wrapper.style.padding = '20px 10px';
        wrapper.innerHTML = element.innerHTML;
        element.innerHTML = '';
        element.appendChild(wrapper);
    }
};
const makeButtonMarkup = ({ button }) => {
    const span = document.createElement('span');
    const chevron = document.createElement('span');
    span.style.whiteSpace = 'nowrap';
    span.style.textOverflow = 'ellipsis';
    span.style.width = 'calc(100% - 40px)';
    span.style.display = 'block';
    span.style.overflow = 'hidden';
    span.style.lineHeight = '1.1em';
    chevron.classList.add(CHEVRON_CLASS.substr(1, CHEVRON_CLASS.length - 1));
    chevron.style.position = 'absolute';
    chevron.style.top = '50%';
    chevron.style.right = '20px';
    chevron.style.marginTop = '-3px';
    chevron.style.borderTop = '7px solid black';
    chevron.style.borderLeft = '5px solid transparent';
    chevron.style.borderRight = '5px solid transparent';
    chevron.style.transform = `rotate(0) translateY(0)`;
    chevron.style.transition = `transform ${openingAnimationSpeed}ms`;
    span.innerHTML = button.innerHTML;
    button.innerHTML = '';
    button.appendChild(span);
    button.appendChild(chevron);
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
        const containers = Array.from(this._shadow.host.querySelectorAll(`div[${ARIA_HIDDEN_ATTR}]`));
        const buttons = Array.from(this._shadow.host.querySelectorAll('button'));
        containers.forEach(async (element) => {
            await makeContainerMarkup({ element });
            if (element.getAttribute(ARIA_HIDDEN_ATTR) === 'false') {
                const elementButton = buttons.find((button) => button.getAttribute('id') ===
                    element.getAttribute(ARIA_CONTROLS_ATTR));
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
        const id = button.getAttribute(ARIA_CONTROLS_ATTR);
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
            if (element.getAttribute(ARIA_HIDDEN_ATTR) === 'false') {
                const child = element.querySelector(SIZE_CLASS);
                if (child) {
                    element.style.height = `${child.offsetHeight}px`;
                    element.style.transition = `none`;
                }
            }
        });
    }
    setStateOpen({ button, element, includeAnimation = true }) {
        const sizeElement = element.querySelector(SIZE_CLASS);
        const chevron = button.querySelector(CHEVRON_CLASS);
        if (sizeElement) {
            sizeElement.style.display = 'block';
            if (!includeAnimation)
                removeAnimation({ element, button });
            if (chevron)
                chevron.style.transform = `rotate(180deg) translateY(-2px) `;
            if (!includeAnimation && chevron) {
                chevron.style.transition = `none`;
                setTimeout(() => {
                    chevron.style.transition = `transform ${openingAnimationSpeed}ms`;
                }, openingAnimationSpeed);
            }
            setTimeout(() => {
                element.style.height = `${sizeElement.offsetHeight}px`;
                button.setAttribute(ACTIVE_ATTR, 'true');
                element.setAttribute(ARIA_HIDDEN_ATTR, 'false');
            }, 100);
        }
    }
    setStateClose({ button, element }) {
        const sizeElement = element.querySelector(SIZE_CLASS);
        const chevron = button.querySelector(CHEVRON_CLASS);
        button.setAttribute(ACTIVE_ATTR, 'false');
        element.setAttribute(ARIA_HIDDEN_ATTR, 'true');
        element.style.height = `0`;
        if (chevron)
            chevron.style.transform = `rotate(0) translateY(0)`;
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