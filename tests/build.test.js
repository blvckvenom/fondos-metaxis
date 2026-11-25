import test from 'node:test';
import assert from 'node:assert/strict';
import { construirGaleria, configJs, sqlSemilla, urlBase } from '../scripts/generar.js';

const catalogo = [{ familia: 'Recepción', descripcion: 'Muro <claro>', fondos: [
  { n: '1', id: 'recepcion', codigo: '1', nombre: 'Recepción', descripcion: 'Listones & repisas' },
  { n: '1b', id: 'recepcion-nogal', codigo: '1B', nombre: "Nogal d'oro", descripcion: 'Oscura' },
] }];

test('construirGaleria genera una tarjeta por fondo con sus enlaces de descarga', () => {
  const html = construirGaleria(catalogo);
  assert.equal(html.match(/<article /g).length, 2);
  assert.match(html, /data-fondo="1-recepcion"/);
  assert.match(html, /href="hd\/metaxis-fondo-1-recepcion-logo-izq\.jpg" download/);
  assert.match(html, /href="4k\/metaxis-fondo-1b-recepcion-nogal-logo-izq-4k\.jpg" download/);
});

test('construirGaleria escapa el texto del catálogo', () => {
  const html = construirGaleria(catalogo);
  assert.match(html, /Muro &lt;claro&gt;/);
  assert.match(html, /Listones &amp; repisas/);
});

test('configJs exporta la conexión cuando hay variables de entorno', () => {
  assert.equal(configJs({ SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'k' }),
    'export const SUPABASE_URL = "https://x.supabase.co";\nexport const SUPABASE_KEY = "k";\n');
});

test('configJs deja la conexión en null si faltan variables', () => {
  assert.equal(configJs({}), 'export const SUPABASE_URL = null;\nexport const SUPABASE_KEY = null;\n');
});

test('sqlSemilla hace upsert sin tocar los contadores y escapa comillas', () => {
  const sql = sqlSemilla(catalogo);
  assert.match(sql, /insert into public\.fondos \(id, codigo, nombre, familia, orden\) values/);
  assert.match(sql, /\('1b-recepcion-nogal', '1B', 'Nogal d''oro', 'Recepción', 2\)/);
  assert.match(sql, /on conflict \(id\) do update set codigo = excluded\.codigo, nombre = excluded\.nombre, familia = excluded\.familia, orden = excluded\.orden;/);
  assert.doesNotMatch(sql, /me_gusta|descargas/);
});

test('urlBase termina en barra para armar URLs absolutas', () => {
  assert.equal(urlBase({ SITIO_URL: 'https://ejemplo.github.io/fondos' }), 'https://ejemplo.github.io/fondos/');
  assert.equal(urlBase({ SITIO_URL: 'https://ejemplo.github.io/fondos/' }), 'https://ejemplo.github.io/fondos/');
});

test('urlBase queda vacía sin SITIO_URL, para que las rutas sigan siendo relativas', () => {
  assert.equal(urlBase({}), '');
});
