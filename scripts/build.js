// Genera dist/: la página con la galería ya renderizada, los módulos del navegador,
// config.js con la conexión (desde SUPABASE_URL y SUPABASE_ANON_KEY) y las imágenes de public/.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { construirGaleria, configJs, urlBase } from './generar.js';

const raiz = new URL('../', import.meta.url);
const ruta = (r) => new URL(r, raiz);
const catalogo = JSON.parse(readFileSync(ruta('src/catalogo.json'), 'utf8'));
const total = catalogo.reduce((n, f) => n + f.fondos.length, 0);

rmSync(ruta('dist'), { recursive: true, force: true });
mkdirSync(ruta('dist'));
cpSync(ruta('public'), ruta('dist'), { recursive: true });
for (const f of ['estilos.css', 'app.js', 'catalogo.js', 'estado.js', 'api.js']) cpSync(ruta(`src/${f}`), ruta(`dist/${f}`));
writeFileSync(ruta('dist/config.js'), configJs(process.env));
writeFileSync(ruta('dist/index.html'), readFileSync(ruta('src/plantilla.html'), 'utf8')
  .replaceAll('{{TOTAL}}', String(total))
  .replaceAll('{{URL}}', urlBase(process.env))
  .replace('{{GALERIA}}', () => construirGaleria(catalogo)));
console.log(`dist/ listo: ${total} fondos, contadores ${process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY ? 'activados' : 'desactivados'}`);
