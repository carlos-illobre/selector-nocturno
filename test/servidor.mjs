// Servidor estático mínimo para la demo y las pruebas (los módulos no cargan desde file://).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.css': 'text/css' };

export function servir(puerto = 0) {
  const servidor = createServer(async (pedido, respuesta) => {
    const ruta = new URL(pedido.url, 'http://x').pathname;
    const archivo = normalize(join(raiz, ruta === '/' ? 'index.html' : ruta));
    if (!archivo.startsWith(raiz)) { respuesta.writeHead(403).end(); return; }
    try {
      const cuerpo = await readFile(archivo);
      respuesta.writeHead(200, { 'content-type': tipos[extname(archivo)] ?? 'application/octet-stream' }).end(cuerpo);
    } catch {
      respuesta.writeHead(404).end('No encontrado');
    }
  });
  return new Promise((listo) => servidor.listen(puerto, '127.0.0.1', () => listo(servidor)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const puerto = Number(process.env.PORT ?? 8080);
  await servir(puerto);
  console.log(`Demo en http://localhost:${puerto}`);
}
