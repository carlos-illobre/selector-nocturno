import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { servir } from './servidor.mjs';

let servidor, navegador, pagina, errores;

before(async () => {
  servidor = await servir();
  navegador = await chromium.launch();
});
after(async () => {
  await navegador?.close();
  servidor?.close();
});

async function abrir(html) {
  pagina = await navegador.newPage();
  errores = [];
  pagina.on('pageerror', (e) => errores.push(e.message));
  const { port } = servidor.address();
  await pagina.goto(`http://127.0.0.1:${port}/test/vacia.html`);
  await pagina.evaluate(async (html) => {
    document.body.innerHTML = html;
    await import('/selector-nocturno.js');
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, html);
  return pagina.locator('selector-nocturno').first();
}

const boton = (s) => s.locator('button');

test('arranca de día y se presenta como un switch con nombre', async () => {
  const s = await abrir('<selector-nocturno></selector-nocturno>');
  await assert.equal(await boton(s).getAttribute('role'), 'switch');
  await assert.equal(await boton(s).getAttribute('aria-checked'), 'false');
  await assert.equal(await boton(s).getAttribute('aria-label'), 'Modo nocturno');
});

test('el atributo label cambia el nombre accesible', async () => {
  const s = await abrir('<selector-nocturno label="Tema oscuro"></selector-nocturno>');
  assert.equal(await boton(s).getAttribute('aria-label'), 'Tema oscuro');
});

test('el atributo noche lo hace arrancar de noche', async () => {
  const s = await abrir('<selector-nocturno noche></selector-nocturno>');
  assert.equal(await boton(s).getAttribute('aria-checked'), 'true');
  assert.equal(await s.evaluate((e) => e.noche), true);
});

test('un clic pasa a noche, refleja el atributo y avisa con change', async () => {
  const s = await abrir('<selector-nocturno></selector-nocturno>');
  await s.evaluate((e) => { window.avisos = []; e.addEventListener('change', (ev) => avisos.push(ev.detail.noche)); });
  await s.click();
  assert.equal(await boton(s).getAttribute('aria-checked'), 'true');
  assert.equal(await s.evaluate((e) => e.hasAttribute('noche')), true);
  await s.click();
  assert.deepEqual(await pagina.evaluate(() => avisos), [true, false]);
});

test('se maneja con el teclado: espacio y Enter', async () => {
  const s = await abrir('<selector-nocturno></selector-nocturno>');
  await pagina.keyboard.press('Tab');
  await pagina.keyboard.press('Space');
  assert.equal(await s.evaluate((e) => e.noche), true);
  await pagina.keyboard.press('Enter');
  assert.equal(await s.evaluate((e) => e.noche), false);
});

test('cambiar la propiedad noche no dispara change', async () => {
  const s = await abrir('<selector-nocturno></selector-nocturno>');
  const avisos = await s.evaluate((e) => {
    let n = 0; e.addEventListener('change', () => n++);
    e.noche = true;
    return n;
  });
  assert.equal(avisos, 0);
  assert.equal(await boton(s).getAttribute('aria-checked'), 'true');
});

test('toggle() cambia y dispara change', async () => {
  const s = await abrir('<selector-nocturno></selector-nocturno>');
  const r = await s.evaluate((e) => {
    let detalle; e.addEventListener('change', (ev) => { detalle = ev.detail; });
    e.toggle();
    return detalle;
  });
  assert.deepEqual(r, { noche: true });
});

test('deshabilitado no cambia ni con clic ni con toggle()', async () => {
  const s = await abrir('<selector-nocturno disabled></selector-nocturno>');
  assert.equal(await boton(s).isDisabled(), true);
  assert.equal(await s.evaluate((e) => { e.toggle(); return e.noche; }), false);
});

test('en un formulario se envía como una casilla y reset vuelve al estado inicial', async () => {
  await abrir('<form><selector-nocturno name="tema" value="oscuro"></selector-nocturno></form>');
  const r = await pagina.evaluate(() => {
    const f = document.querySelector('form');
    const s = f.querySelector('selector-nocturno');
    const antes = new FormData(f).get('tema');
    s.toggle();
    const despues = new FormData(f).get('tema');
    f.reset();
    return [antes, despues, s.noche];
  });
  assert.deepEqual(r, [null, 'oscuro', false]);
});

test('varias instancias son independientes', async () => {
  await abrir('<selector-nocturno id="a"></selector-nocturno><selector-nocturno id="b"></selector-nocturno>');
  await pagina.locator('#a').click();
  assert.deepEqual(await pagina.evaluate(() => [a.noche, b.noche]), [true, false]);
});

test('se puede importar en Node (SSR) sin romper', async () => {
  const m = await import('../selector-nocturno.js');
  assert.equal(typeof m.SelectorNocturno, 'function');
});

test('sin errores en la consola', async () => {
  await abrir('<selector-nocturno></selector-nocturno>');
  assert.deepEqual(errores, []);
});
