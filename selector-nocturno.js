/**
 * <selector-nocturno> — selector de modo día / noche con animación.
 *
 * Componente web sin dependencias: sirve en HTML puro, React, Vue, Angular, Svelte…
 *
 * Uso (detalle completo en el README):
 *   <script type="module" src="selector-nocturno.js"><\/script>
 *   <selector-nocturno></selector-nocturno>
 *
 * Atributos / propiedades:
 *   noche      (booleano)  true = modo noche. Refleja el estado.
 *   disabled   (booleano)  no se puede tocar.
 *   label      (texto)     nombre para lectores de pantalla. Por defecto «Modo nocturno».
 *   name       (texto)     si está dentro de un <form>, se envía como un checkbox.
 *   value      (texto)     valor que se envía de noche. Por defecto «on».
 *
 * Método:
 *   toggle()   cambia de modo como si lo hubieran tocado.
 *
 * Evento:
 *   change     se dispara al tocarlo; event.detail.noche dice el estado nuevo.
 *
 * Tamaño: font-size del elemento (por defecto 18px; todo está en em).
 * Colores, borde y duración: variables CSS --sn-* (ver ESTILOS, abajo).
 *
 * https://github.com/carlos-illobre/selector-nocturno
 */

const ESTILOS = /* css */ `
  :host {
    --sn-duracion: 700ms;
    --sn-curva: cubic-bezier(.6, .05, .3, .95);
    /* Profundidad: el canal parece tallado en la superficie que lo rodea.
       Son transparentes, así que sirven sobre cualquier fondo. */
    --sn-borde-sombra: rgba(20, 30, 50, .22);
    --sn-borde-luz: rgba(255, 255, 255, .75);
    --sn-cielo-dia: #3f7fcb;
    --sn-cielo-noche: #1f2a42;
    --sn-sol: #f7b52c;
    --sn-sol-sombra: #d9921a;
    --sn-luna: #c6cad2;
    --sn-luna-sombra: #a2a8b3;
    --sn-crater: #8f97a6;
    --sn-nube-frente: #f1f5fa;
    --sn-nube-fondo: #b5cfec;
    --sn-estrella: #ffffff;
    --sn-foco: var(--sn-sol);

    display: inline-block;
    font-size: 18px;
    vertical-align: middle;
    -webkit-tap-highlight-color: transparent;
  }
  :host([hidden]) { display: none; }
  :host([disabled]) { opacity: .55; pointer-events: none; }

  button {
    --ancho: 11em;
    --alto: 4.4em;
    --margen: .4em;
    --perilla: calc(var(--alto) - 2 * var(--margen));
    --recorrido: calc(var(--ancho) - var(--perilla) - 2 * var(--margen));
    /* Estado: todo lo que se mueve lee estas variables; la noche y el mouse solo las cambian */
    --t: var(--sn-duracion) var(--sn-curva);
    --pos: 0em;        /* dónde está la perilla */
    --empuje: 0em;     /* el empujoncito del mouse */
    --noche: 0;        /* 0 de día, 1 de noche: opacidades */

    position: relative;
    display: block;
    width: var(--ancho);
    height: var(--alto);
    margin: .3em;              /* deja lugar al borde, que se dibuja afuera */
    padding: 0;
    border: 0;
    border-radius: 999px;
    font: inherit;
    cursor: pointer;
    background: transparent;
    isolation: isolate;
  }
  :host([noche]) button { --pos: var(--recorrido); --noche: 1; }
  @media (hover: hover) {
    button:hover { --empuje: .35em; }
    :host([noche]) button:hover { --empuje: -.35em; }
  }
  /* Sin animación al cargar (no «salta» si arranca de noche) ni si el sistema pide menos movimiento */
  :host(:not([data-listo])) button { --t: 0s; }
  @media (prefers-reduced-motion: reduce) { button { --t: 1ms; } }

  /* El borde con profundidad: sombra arriba, luz abajo, sin línea sólida */
  button::before {
    content: "";
    position: absolute;
    inset: -.22em;
    border-radius: inherit;
    z-index: -1;
    background: linear-gradient(180deg, var(--sn-borde-sombra), transparent 45%, var(--sn-borde-luz));
    box-shadow:
      0 -.08em .2em var(--sn-borde-sombra),
      0 .12em .25em var(--sn-borde-luz);
  }
  button:focus-visible { outline: 3px solid var(--sn-foco); outline-offset: .6em; }

  /* Una sola regla de movimiento para todas las piezas */
  .cielo::before, .halos, .estrellas, .nubes, .nube, .perilla, .luna {
    transition: transform var(--t), opacity var(--t);
  }
  .cielo, .cielo::before, .cielo::after, .estrellas, .nubes { position: absolute; inset: 0; }
  .cielo::before, .cielo::after { content: ""; }
  .halos i, .estrellas i, .nube, .perilla, .luna, .luna i { position: absolute; border-radius: 50%; }

  .cielo {
    border-radius: inherit;
    overflow: hidden;
    background: var(--sn-cielo-dia);
    isolation: isolate;
  }
  .cielo::before {               /* la noche: una capa que aparece */
    background: linear-gradient(90deg,
      color-mix(in srgb, var(--sn-cielo-noche), #000 25%),
      var(--sn-cielo-noche) 60%,
      color-mix(in srgb, var(--sn-cielo-noche), #fff 8%));
    opacity: var(--noche);
  }
  .cielo::after {                /* el canal hundido, por encima de todo */
    border-radius: inherit;
    box-shadow:
      inset 0 .35em .55em rgba(0, 0, 0, .5),
      inset 0 .1em .15em rgba(0, 0, 0, .35),
      inset 0 -.12em .3em rgba(255, 255, 255, .22);
    z-index: 10;
    pointer-events: none;
  }

  /* Anillos de luz: acompañan a la perilla */
  .halos {
    position: absolute;
    top: 50%;
    left: calc(var(--margen) + var(--perilla) / 2);
    transform: translateX(calc(var(--pos) + var(--empuje)));
  }
  .halos i {
    width: var(--d);
    height: var(--d);
    background: rgba(255, 255, 255, .09);
    translate: -50% -50%;
  }

  .estrellas {
    opacity: var(--noche);
    transform: translateY(calc((1 - var(--noche)) * -1.2em));
  }
  .estrellas i {
    left: var(--x);
    top: var(--y);
    width: .18em;
    height: .18em;
    background: var(--sn-estrella);
  }
  .estrellas i.brillo {
    width: .55em;
    height: .55em;
    border-radius: 0;
    scale: var(--s, 1);
    clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
  }

  /* Nubes: un círculo y sus copias con box-shadow, del color del texto (currentColor) */
  .nubes { transform: translate(calc(var(--noche) * 1.5em), calc(var(--noche) * 3.2em)); }
  .nube {
    width: 2.6em;
    height: 2.6em;
    background: currentColor;
  }
  .nube.fondo {
    right: -.6em;
    bottom: .3em;
    color: var(--sn-nube-fondo);
    box-shadow: -1.7em .9em 0 .1em, -3.4em 1.6em 0 0, .4em -1.4em 0 .2em;
    transform: translate(calc(var(--noche) * .5em), calc(var(--noche) * .6em));
    transition-delay: 60ms;
  }
  .nube.frente {
    right: -1em;
    bottom: -1.1em;
    color: var(--sn-nube-frente);
    box-shadow: -1.9em .5em 0 0, -3.8em 1.2em 0 -.1em, .5em -1.3em 0 .1em;
  }

  /* Sol y luna: la misma esfera con distinto color, sombra y sombra exterior */
  .perilla, .luna {
    background: var(--color);
    box-shadow:
      var(--afuera),
      inset -.15em -.2em .25em var(--sombra),
      inset .15em .2em .25em rgba(255, 255, 255, var(--brillo));
  }
  .perilla {
    --color: var(--sn-sol);
    --sombra: var(--sn-sol-sombra);
    --afuera: 0 .2em .45em rgba(0, 0, 0, .35);
    --brillo: .45;
    top: var(--margen);
    left: var(--margen);
    width: var(--perilla);
    height: var(--perilla);
    overflow: hidden;
    z-index: 5;
    transform: translateX(calc(var(--pos) + var(--empuje)));
  }
  .luna {
    --color: var(--sn-luna);
    --sombra: var(--sn-luna-sombra);
    --afuera: -.12em 0 .3em rgba(0, 0, 0, .25);
    --brillo: .5;
    inset: -1px;               /* tapa el borde del sol: sin hilo amarillo */
    transform: translateX(calc((1 - var(--noche)) * 105%));
  }
  .luna i {
    left: var(--x);
    top: var(--y);
    width: var(--d);
    height: var(--d);
    background: var(--sn-crater);
    box-shadow: inset .08em .1em .12em rgba(0, 0, 0, .25);
  }
`;

/* El dibujo, como datos (medidas en em). Para mover una estrella o un cráter se cambia acá. */
const HALOS = [5.2, 7.2, 9.4];                        // diámetros
const ESTRELLAS = [                                   // [x, y, brillo?, escala?]
  [1.4, 1.2], [2.3, 2.9], [3.6, 1.9], [4.4, 3.3], [1.1, 3.1], [5.3, .9],
  [2.6, .9, true], [4.9, 2.3, true], [1.6, 2.2, true, .7],
];
const CRATERES = [[.55, 1.15, 1.1], [1.55, .45, .7], [2.05, 1.75, .75]];  // [x, y, diámetro]

const MARCADO = `
  <button type="button" role="switch" part="boton">
    <span class="cielo">
      <span class="halos">${HALOS.map((d) => `<i style="--d:${d}em"></i>`).join('')}</span>
      <span class="estrellas">${ESTRELLAS.map(([x, y, brillo, s = 1]) =>
        `<i ${brillo ? 'class="brillo" ' : ''}style="--x:${x}em;--y:${y}em;--s:${s}"></i>`).join('')}</span>
      <span class="nubes"><span class="nube fondo"></span><span class="nube frente"></span></span>
      <span class="perilla"><span class="luna">${CRATERES.map(([x, y, d]) =>
        `<i style="--x:${x}em;--y:${y}em;--d:${d}em"></i>`).join('')}</span></span>
    </span>
  </button>
`;

// Hoja de estilos y plantilla: se crean una vez, la primera vez que hace falta, y las
// comparten todas las instancias.
let recursos;
function compartidos() {
  if (!recursos) {
    const hoja = new CSSStyleSheet();
    hoja.replaceSync(ESTILOS);
    const molde = document.createElement('template');
    molde.innerHTML = MARCADO;
    recursos = { hoja, molde };
  }
  return recursos;
}

// En el servidor (SSR con Next, Nuxt, Astro…) no hay HTMLElement: el módulo se puede
// importar igual y el elemento se registra recién en el navegador.
const Base = globalThis.HTMLElement ?? class {};

export class SelectorNocturno extends Base {
  static formAssociated = true;
  static observedAttributes = ['noche', 'disabled', 'label', 'value'];

  #internos = this.attachInternals();
  #boton;
  #inicial;

  constructor() {
    super();
    const { hoja, molde } = compartidos();
    const raiz = this.attachShadow({ mode: 'open', delegatesFocus: true });
    raiz.adoptedStyleSheets = [hoja];
    raiz.append(molde.content.cloneNode(true));
    this.#boton = raiz.querySelector('button');
    this.#boton.addEventListener('click', () => this.toggle());
  }

  connectedCallback() {
    this.#inicial ??= this.noche;
    this.#actualizar();
    // Las transiciones se habilitan después del primer pintado.
    requestAnimationFrame(() => requestAnimationFrame(() => this.toggleAttribute('data-listo', true)));
  }

  attributeChangedCallback() { this.#actualizar(); }

  get noche() { return this.hasAttribute('noche'); }
  set noche(v) { this.toggleAttribute('noche', Boolean(v)); }

  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(v) { this.toggleAttribute('disabled', Boolean(v)); }

  get value() { return this.getAttribute('value') ?? 'on'; }
  set value(v) { this.setAttribute('value', v); }

  /** Cambia de modo como si lo hubieran tocado (dispara change). Deshabilitado, no hace nada. */
  toggle() {
    if (this.disabled) return;
    this.noche = !this.noche;
    this.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { noche: this.noche } }));
  }

  #actualizar() {
    const noche = this.noche;
    this.#boton.setAttribute('aria-checked', String(noche));
    this.#boton.setAttribute('aria-label', this.getAttribute('label') ?? 'Modo nocturno');
    this.#boton.disabled = this.disabled;
    this.#internos.setFormValue(noche ? this.value : null);
  }

  /** Formularios: al resetear vuelve al estado con que se cargó. */
  formResetCallback() { this.noche = this.#inicial; }
}

if (globalThis.customElements && !customElements.get('selector-nocturno')) {
  customElements.define('selector-nocturno', SelectorNocturno);
}
