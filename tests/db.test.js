import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { crearApi } from '../src/api.js';
import { listaPlana } from '../src/catalogo.js';

// Prueba de integración contra la base real: correr con `node --env-file=.env --test tests/db.test.js`.
const { SUPABASE_URL: url, SUPABASE_ANON_KEY: key } = process.env;
const opciones = { skip: !url && 'sin SUPABASE_URL' };
const catalogo = JSON.parse(readFileSync(new URL('../src/catalogo.json', import.meta.url)));

test('la base expone un fondo por cada entrada del catálogo', opciones, async () => {
  const filas = await crearApi({ url, key }).conteos();
  assert.deepEqual(filas.map((f) => f.id).sort(), listaPlana(catalogo).map((f) => f.id).sort());
});

test('un me gusta suma uno y quitarlo vuelve al valor anterior', opciones, async () => {
  const api = crearApi({ url, key });
  const antes = (await api.conteos()).find((f) => f.id === '1-recepcion');
  assert.equal((await api.registrar('1-recepcion', 'me_gusta')).me_gusta, antes.me_gusta + 1);
  assert.equal((await api.registrar('1-recepcion', 'quitar_me_gusta')).me_gusta, antes.me_gusta);
});

test('rechaza tipos de evento y fondos desconocidos', opciones, async () => {
  const api = crearApi({ url, key });
  await assert.rejects(api.registrar('1-recepcion', 'borrar'));
  await assert.rejects(api.registrar('no-existe', 'me_gusta'));
});

test('la clave pública no puede escribir directo en la tabla', opciones, async () => {
  const r = await fetch(`${url}/rest/v1/fondos?id=eq.1-recepcion`, {
    method: 'PATCH',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ me_gusta: 9999 }),
  });
  const cuerpo = await r.json();
  assert.ok(!r.ok || cuerpo.length === 0);
});
