# Selector nocturno

Selector de modo día / noche con animación, hecho como **componente web**: una etiqueta
`<selector-nocturno>` en un solo archivo JavaScript, sin dependencias. Funciona en HTML puro,
React, Vue, Angular, Svelte, Astro o cualquier proyecto web.

![El selector pasando de día a noche y de vuelta](docs/animacion.gif)

**[Ver la demo en vivo →](https://carlos-illobre.github.io/selector-nocturno/)**

- **Animado:** el sol se desliza, la luna lo tapa, el cielo se oscurece, las nubes bajan y
  aparecen las estrellas.
- **Accesible:** es un `switch` para lectores de pantalla y se maneja con Tab, espacio y Enter.
  Si el sistema pide menos movimiento, cambia sin animar.
- **Aislado:** sus estilos viven dentro del componente (Shadow DOM) y no chocan con los de tu
  página.
- **Personalizable:** el tamaño se cambia con `font-size`; los colores, el borde y la
  duración, con variables CSS.
- **Funciona en formularios:** con `name`, se envía igual que una casilla de verificación.
- **Libre:** licencia 0BSD; usalo, copialo y cambialo para lo que quieras, sin pedir permiso ni citar a nadie.
- **Liviano:** un archivo de unos 11 KB sin comprimir, sin imágenes ni dependencias.

## Índice

- [Instalación](#instalación)
- [Uso básico](#uso-básico)
- [Cambiar el tema de la página](#cambiar-el-tema-de-la-página)
- [Referencia](#referencia)
- [Personalización](#personalización)
- [Uso con frameworks](#uso-con-frameworks)
- [TypeScript](#typescript)
- [Accesibilidad](#accesibilidad)
- [Navegadores compatibles](#navegadores-compatibles)
- [Cómo está hecho](#cómo-está-hecho)
- [Desarrollo](#desarrollo)
- [Licencia](#licencia)

## Instalación

Elegí una de las tres formas.

### 1. Desde un CDN (sin instalar nada)

```html
<script type="module"
  src="https://cdn.jsdelivr.net/gh/carlos-illobre/selector-nocturno@main/selector-nocturno.js"></script>
```

`@main` trae siempre la última versión. Para que tu página no cambie sola cuando salga una
nueva, fijala con el código de un commit en lugar de `main`, por ejemplo `@395116f`.

### 2. Con npm, pnpm o yarn

El paquete se instala directamente desde GitHub:

```bash
npm install github:carlos-illobre/selector-nocturno
# o
pnpm add github:carlos-illobre/selector-nocturno
# o
yarn add selector-nocturno@github:carlos-illobre/selector-nocturno
```

Después, importalo una vez en el punto de entrada de tu aplicación (por ejemplo `main.js`). Con
eso la etiqueta queda registrada en toda la página:

```js
import 'selector-nocturno';
```

### 3. Copiando el archivo

Bajá [`selector-nocturno.js`](selector-nocturno.js), ponelo junto a tus archivos y cargalo:

```html
<script type="module" src="./selector-nocturno.js"></script>
```

## Uso básico

```html
<selector-nocturno></selector-nocturno>

<script type="module">
  const selector = document.querySelector('selector-nocturno');
  selector.addEventListener('change', (evento) => {
    console.log(evento.detail.noche ? 'Ahora es de noche' : 'Ahora es de día');
  });
</script>
```

El componente **solo muestra y avisa**: no cambia los colores de tu página por su cuenta. Vos
decidís qué hacer cuando cambia, como en el ejemplo siguiente.

## Cambiar el tema de la página

Este ejemplo, que es el que usa la [demo](https://carlos-illobre.github.io/selector-nocturno/):

- arranca con el tema que el usuario eligió la última vez o, si nunca eligió, con el del sistema;
- aplica el tema **antes de pintar**, para que no aparezca un instante con el color equivocado;
- guarda la elección.

```html
<head>
  <script>
    // Va en el <head>, antes de los estilos.
    try {
      const guardado = localStorage.getItem('tema');
      const oscuro = guardado
        ? guardado === 'oscuro'
        : matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('oscuro', oscuro);
    } catch { /* sin almacenamiento: queda el tema claro */ }
  </script>
  <style>
    :root        { --fondo: #ffffff; --texto: #1c2230; }
    :root.oscuro { --fondo: #1b2233; --texto: #e3e8f0; }
    body { background: var(--fondo); color: var(--texto); }
  </style>
</head>
<body>
  <selector-nocturno label="Tema oscuro"></selector-nocturno>

  <script type="module" src="selector-nocturno.js"></script>
  <script type="module">
    const selector = document.querySelector('selector-nocturno');
    selector.noche = document.documentElement.classList.contains('oscuro');

    selector.addEventListener('change', (e) => {
      document.documentElement.classList.toggle('oscuro', e.detail.noche);
      try { localStorage.setItem('tema', e.detail.noche ? 'oscuro' : 'claro'); } catch {}
    });
  </script>
</body>
```

Al cargar no hay animación: si la página arranca de noche, el selector aparece directamente de
noche. La animación se ve solo cuando alguien lo toca.

## Referencia

### Atributos y propiedades

| Atributo | Propiedad | Tipo | Por defecto | Qué hace |
|---|---|---|---|---|
| `noche` | `.noche` | booleano | `false` | Modo noche. El atributo refleja el estado: si lo tocan, aparece o desaparece. |
| `disabled` | `.disabled` | booleano | `false` | No se puede tocar y se ve atenuado. |
| `label` | — | texto | `Modo nocturno` | Nombre que leen los lectores de pantalla. |
| `name` | — | texto | — | Nombre del campo cuando está dentro de un `<form>`. |
| `value` | `.value` | texto | `on` | Valor que se envía en el formulario cuando está de noche. |

```html
<selector-nocturno noche label="Tema oscuro"></selector-nocturno>
```

```js
selector.noche = true;      // pasa a noche (con animación si ya estaba en pantalla)
selector.disabled = true;
```

Cambiar `.noche` o el atributo `noche` desde el código **no dispara** `change`: el evento es
solo para cuando cambia porque alguien lo tocó. Así podés sincronizarlo con tu estado sin
generar ciclos.

### Método

| Método | Qué hace |
|---|---|
| `toggle()` | Cambia de modo como si lo hubieran tocado: anima y dispara `change`. Si está deshabilitado, no hace nada. |

### Evento

| Evento | Cuándo | `event.detail` |
|---|---|---|
| `change` | Cuando alguien lo toca (clic, toque, espacio, Enter) o se llama a `toggle()`. Burbujea. | `{ noche: boolean }` |

### Formularios

Se comporta como una casilla de verificación: si está de noche, envía `name=value`; si está de
día, no envía nada. Al resetear el formulario vuelve al estado con que se cargó.

```html
<form>
  <selector-nocturno name="tema" value="oscuro"></selector-nocturno>
  <button>Guardar</button>
</form>
<!-- De noche se envía tema=oscuro -->
```

## Personalización

### Tamaño

Todo está medido en relación al tamaño de letra del elemento. Por defecto mide 18px, que da un
selector de unos 200 × 80 px.

```css
selector-nocturno { font-size: 10px; }   /* chico: ~110 × 44 px */
selector-nocturno { font-size: 24px; }   /* grande */
```

### Colores, borde y duración

Se cambian con variables CSS desde tu hoja de estilos, para todos los selectores o para uno:

```css
selector-nocturno.atardecer {
  --sn-cielo-dia: #e0785a;
  --sn-cielo-noche: #3b2350;
  --sn-sol: #ffd25e;
  --sn-nube-fondo: #f2b49b;
  --sn-nube-frente: #fde4d6;
  --sn-duracion: 1s;
}
```

| Variable | Por defecto | Qué pinta |
|---|---|---|
| `--sn-duracion` | `700ms` | Duración de la animación. |
| `--sn-curva` | `cubic-bezier(.6, .05, .3, .95)` | Aceleración de la animación. |
| `--sn-cielo-dia` | `#3f7fcb` | Cielo de día. |
| `--sn-cielo-noche` | `#1f2a42` | Cielo de noche (los extremos se aclaran y oscurecen solos). |
| `--sn-sol` | `#f7b52c` | Sol. |
| `--sn-sol-sombra` | `#d9921a` | Sombra del sol. |
| `--sn-luna` | `#c6cad2` | Luna. |
| `--sn-luna-sombra` | `#a2a8b3` | Sombra de la luna. |
| `--sn-crater` | `#8f97a6` | Cráteres. |
| `--sn-nube-frente` | `#f1f5fa` | Nube de adelante. |
| `--sn-nube-fondo` | `#b5cfec` | Nube de atrás. |
| `--sn-estrella` | `#ffffff` | Estrellas. |
| `--sn-borde-luz` | `rgba(255,255,255,.75)` | Brillo del borde, abajo. |
| `--sn-borde-sombra` | `rgba(20,30,50,.22)` | Sombra del borde, arriba. |
| `--sn-foco` | el color del sol | Contorno al llegar con Tab. |

**El borde.** No es una línea: es una sombra arriba y un brillo abajo, para que el selector
parezca tallado en la superficie. Las dos variables son semitransparentes, así que toman el
color del fondo. Sobre un fondo oscuro conviene bajar el brillo:

```css
.oscuro selector-nocturno {
  --sn-borde-luz: rgba(255, 255, 255, .1);
  --sn-borde-sombra: rgba(0, 0, 0, .5);
}
```

### Retoques finos con `::part`

El botón interno está expuesto como la parte `boton`, por si necesitás algo que las variables
no cubren:

```css
selector-nocturno::part(boton) { cursor: grab; }
```

## Uso con frameworks

En todos los casos, primero instalalo e importalo una vez (`import 'selector-nocturno'`).

### React

React 19 pasa las propiedades a los componentes web sin problema. Para que funcione igual en
React 18 y 19, este envoltorio usa una referencia:

```jsx
import { useEffect, useRef, useState } from 'react';
import 'selector-nocturno';

export function SelectorNocturno({ noche, onChange, ...resto }) {
  const ref = useRef(null);

  useEffect(() => { ref.current.noche = noche; }, [noche]);

  useEffect(() => {
    const el = ref.current;
    const avisar = (e) => onChange?.(e.detail.noche);
    el.addEventListener('change', avisar);
    return () => el.removeEventListener('change', avisar);
  }, [onChange]);

  return <selector-nocturno ref={ref} {...resto} />;
}

// Uso
function App() {
  const [oscuro, setOscuro] = useState(false);
  return <SelectorNocturno noche={oscuro} onChange={setOscuro} label="Tema oscuro" />;
}
```

**Next.js y otros con SSR:** el módulo se puede importar en el servidor sin romper, porque la
etiqueta se registra recién en el navegador. Poné el envoltorio en un componente con
`'use client'` al principio.

### Vue 3

Avisale a Vue que es un componente web, en `vite.config.js`:

```js
vue({
  template: {
    compilerOptions: { isCustomElement: (tag) => tag === 'selector-nocturno' },
  },
})
```

```vue
<script setup>
import { ref } from 'vue';
import 'selector-nocturno';
const oscuro = ref(false);
</script>

<template>
  <selector-nocturno :noche="oscuro" @change="oscuro = $event.detail.noche" />
</template>
```

### Angular

Agregá `CUSTOM_ELEMENTS_SCHEMA` al componente que lo usa:

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import 'selector-nocturno';

@Component({
  selector: 'app-tema',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<selector-nocturno [noche]="oscuro" (change)="oscuro = $any($event).detail.noche" />`,
})
export class TemaComponent {
  oscuro = false;
}
```

### Svelte 5

```svelte
<script>
  import 'selector-nocturno';
  let oscuro = $state(false);
</script>

<selector-nocturno noche={oscuro} onchange={(e) => (oscuro = e.detail.noche)}></selector-nocturno>
```

### Astro

```astro
<selector-nocturno></selector-nocturno>
<script>
  import 'selector-nocturno';
</script>
```

## TypeScript

El paquete trae sus tipos (`selector-nocturno.d.ts`). `document.querySelector('selector-nocturno')`
devuelve un `SelectorNocturno` con `.noche`, `.disabled`, `.value` y `toggle()`, y el evento
`change` viene tipado:

```ts
import type { SelectorNocturnoChangeEvent } from 'selector-nocturno';

const selector = document.querySelector('selector-nocturno')!;
selector.addEventListener('change', (e: SelectorNocturnoChangeEvent) => {
  console.log(e.detail.noche);
});
```

## Accesibilidad

- Adentro hay un `<button role="switch">` con `aria-checked`, así que los lectores de pantalla
  lo anuncian como un interruptor, con su estado.
- El nombre accesible sale del atributo `label` (por defecto, «Modo nocturno»). Si el
  selector cambia el tema de la página, `label="Tema oscuro"` es más claro.
- Se llega con Tab y se cambia con espacio o Enter. Al llegar con el teclado aparece un
  contorno; con el mouse, no.
- Respeta `prefers-reduced-motion`: si el sistema pide menos movimiento, cambia sin animar.
- Deshabilitado, no recibe el foco y se ve atenuado.

## Navegadores compatibles

Chrome y Edge 111 o posterior, Firefox 113 o posterior y Safari 16.4 o posterior (escritorio y
celular). Son los primeros que tienen todo lo que usa: componentes web asociados a formularios,
hojas de estilo compartidas y `color-mix()`.

Las pruebas automáticas corren en Chromium. En Firefox y Safari no hay pruebas automáticas.

## Cómo está hecho

Todo el componente está en [`selector-nocturno.js`](selector-nocturno.js):

- **El dibujo son datos.** Las posiciones de las estrellas y los cráteres están en dos listas
  al principio del archivo (`ESTRELLAS` y `CRATERES`). Para mover una estrella se cambia un
  número, no el CSS. Los tres anillos de luz son un solo elemento con tres degradés circulares.
- **El estado son tres variables CSS.** `--pos` (dónde está la perilla), `--noche` (0 de día,
  1 de noche) y `--empuje` (el amago al pasar el mouse). La noche y el mouse solo cambian esas
  variables; cada pieza calcula su posición y su opacidad a partir de ellas.
- **Una sola regla de movimiento.** Todas las piezas comparten la misma transición, leída de
  una variable `--t`. Para quitar la animación, al cargar o cuando el sistema pide menos
  movimiento, alcanza con cambiar `--t`.
- **Se anima con `transform` y `opacity`.** El navegador las mueve sin recalcular el diseño de
  la página, así que la animación va fluida.
- **Se crea una sola vez.** La hoja de estilos y la plantilla se arman con el primer selector
  y las comparten todos los demás.
- **El sol y la luna** son la misma esfera con distintos colores. La luna vive dentro del
  sol y entra desde la derecha, por eso al pasar se ve la medialuna amarilla.
- **Las nubes** son un círculo con copias hechas con `box-shadow`, del color del texto
  (`currentColor`), así que cada nube define su color una sola vez.

## Desarrollo

```bash
npm install     # instala Playwright, que corre las pruebas en un navegador real
npx playwright install chromium   # solo la primera vez, si no tenés el navegador
npm test        # 12 pruebas en Chromium
npm run demo    # la demo en http://localhost:8080
```

| Archivo | Qué es |
|---|---|
| `selector-nocturno.js` | El componente. Es lo único que necesitás para usarlo. |
| `selector-nocturno.d.ts` | Los tipos para TypeScript. |
| `index.html` | La demo, publicada en GitHub Pages. |
| `test/` | Las pruebas y un servidor mínimo para la demo. |
| `.github/workflows/pages.yml` | Prueba y publica la demo con cada cambio en `main`. |
| `docs/` | Las imágenes de este README. |

### La demo en GitHub Pages

La demo es `index.html`, en la raíz del repositorio. La publica el flujo
[`.github/workflows/pages.yml`](.github/workflows/pages.yml) con cada push a `main`:

1. corre las 12 pruebas en Chromium;
2. si pasan, publica `index.html` y `selector-nocturno.js` en
   <https://carlos-illobre.github.io/selector-nocturno/>.

Si una prueba falla, la demo no se actualiza y queda la versión anterior. También se puede
publicar a mano desde la pestaña **Actions** → *Demo en GitHub Pages* → **Run workflow**.

Para que funcione, Pages tiene que estar configurado con **Settings → Pages → Source:
GitHub Actions**.

## Licencia

[0BSD](LICENSE) (BSD Zero Clause). Podés usarlo, copiarlo, modificarlo y distribuirlo, gratis o
cobrando, en proyectos abiertos o cerrados, **sin ninguna condición**: no hace falta citar al
autor ni incluir el aviso de la licencia. Se entrega tal cual, sin garantías.
