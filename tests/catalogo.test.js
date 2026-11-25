import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { idFondo, archivos, listaPlana } from '../src/catalogo.js';

const catalogo = JSON.parse(readFileSync(new URL('../src/catalogo.json', import.meta.url)));

test('idFondo une el número de archivo con el id de escena', () => {
  assert.equal(idFondo({ n: '2b3', id: 'arcos-azules' }), '2b3-arcos-azules');
});

test('archivos arma las rutas de miniatura, HD y 4K para un lado', () => {
  assert.deepEqual(archivos({ n: '1', id: 'recepcion' }, 'der'), {
    mini: 'mini/metaxis-fondo-1-recepcion-logo-der.jpg',
    hd: 'hd/metaxis-fondo-1-recepcion-logo-der.jpg',
    k4: '4k/metaxis-fondo-1-recepcion-logo-der-4k.jpg',
  });
});

test('listaPlana numera los fondos en el orden del catálogo y conserva la familia', () => {
  const lista = listaPlana([
    { familia: 'A', fondos: [{ n: '1', id: 'x', codigo: '1', nombre: 'Uno' }] },
    { familia: 'B', fondos: [{ n: '2', id: 'y', codigo: '2', nombre: 'Dos' }, { n: '2b', id: 'z', codigo: '2B', nombre: 'Tres' }] },
  ]);
  assert.deepEqual(lista, [
    { id: '1-x', codigo: '1', nombre: 'Uno', familia: 'A', orden: 1 },
    { id: '2-y', codigo: '2', nombre: 'Dos', familia: 'B', orden: 2 },
    { id: '2b-z', codigo: '2B', nombre: 'Tres', familia: 'B', orden: 3 },
  ]);
});

test('el catálogo real no repite ids', () => {
  const ids = listaPlana(catalogo).map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.length > 0);
});
