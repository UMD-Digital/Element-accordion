declare type StateProps = {
    button: HTMLButtonElement;
    element: HTMLDivElement;
    includeAnimation?: boolean;
};
export default class AccordionElement extends HTMLElement {
    _shadow: ShadowRoot;
    constructor();
    eventClick(button: HTMLButtonElement): void;
    eventResize({ elements }: {
        elements: HTMLDivElement[];
    }): void;
    setStateOpen({ button, element, includeAnimation }: StateProps): void;
    setStateClose({ button, element }: StateProps): void;
}
declare global {
    interface Window {
        AccordionElement: typeof AccordionElement;
    }
}
export {};
//# sourceMappingURL=index.d.ts.map