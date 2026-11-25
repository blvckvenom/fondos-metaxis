import test from 'node:test';
import assert from 'node:assert/strict';
import { alternar, conteosPorId } from '../src/estado.js';

test('alternar agrega el fondo y pide sumar un me gusta', () => {
  assert.deepEqual(alternar(['a'], 'b'), { ids: ['a', 'b'], evento: 'me_gusta' });
});

test('alternar quita el fondo ya marcado y pide restar', () => {
  assert.deepEqual(alternar(['a', 'b'], 'a'), { ids: ['b'], evento: 'quitar_me_gusta' });
});

test('alternar no modifica la lista original', () => {
  const ids = ['a'];
  alternar(ids, 'b');
  assert.deepEqual(ids, ['a']);
});

test('conteosPorId indexa las filas de la base por id', () => {
  assert.deepEqual(conteosPorId([{ id: 'a', me_gusta: 2, descargas: 5 }]), { a: { me_gusta: 2, descargas: 5 } });
});
