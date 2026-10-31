/** Detalle del evento `change`. */
export interface SelectorNocturnoChangeDetail {
  /** `true` si quedó en modo noche. */
  noche: boolean;
}

export type SelectorNocturnoChangeEvent = CustomEvent<SelectorNocturnoChangeDetail>;

/** `<selector-nocturno>`: selector de modo día / noche con animación. */
export declare class SelectorNocturno extends HTMLElement {
  static formAssociated: true;
  /** Modo noche. Refleja el atributo `noche`. */
  noche: boolean;
  /** Deshabilitado. Refleja el atributo `disabled`. */
  disabled: boolean;
  /** Valor que se envía en un formulario cuando está de noche. Por defecto `"on"`. */
  value: string;
  /** Cambia de modo como si lo hubieran tocado (dispara `change`). */
  toggle(): void;

  addEventListener(
    type: 'change', listener: (this: SelectorNocturno, ev: SelectorNocturnoChangeEvent) => unknown,
    options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K, listener: (this: SelectorNocturno, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions): void;
  addEventListener(
    type: string, listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions): void;
}

declare global {
  interface HTMLElementTagNameMap {
    'selector-nocturno': SelectorNocturno;
  }
}
