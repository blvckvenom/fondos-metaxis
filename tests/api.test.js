import test from 'node:test';
import assert from 'node:assert/strict';
import { crearApi } from '../src/api.js';

const falso = (respuesta) => {
  const llamadas = [];
  const fetch = async (url, opciones) => { llamadas.push({ url, opciones }); return respuesta; };
  return { fetch, llamadas };
};

test('conteos lee id, me_gusta y descargas con la clave pública', async () => {
  const { fetch, llamadas } = falso({ ok: true, json: async () => [{ id: 'a', me_gusta: 1, descargas: 0 }] });
  const api = crearApi({ url: 'https://x.supabase.co', key: 'clave', fetch });
  assert.deepEqual(await api.conteos(), [{ id: 'a', me_gusta: 1, descargas: 0 }]);
  assert.equal(llamadas[0].url, 'https://x.supabase.co/rest/v1/fondos?select=id,me_gusta,descargas');
  assert.equal(llamadas[0].opciones.headers.apikey, 'clave');
});

test('registrar llama a la función registrar_evento y devuelve los contadores', async () => {
  const { fetch, llamadas } = falso({ ok: true, json: async () => [{ total_me_gusta: 3, total_descargas: 7 }] });
  const api = crearApi({ url: 'https://x.supabase.co', key: 'clave', fetch });
  assert.deepEqual(await api.registrar('1-recepcion', 'me_gusta'), { me_gusta: 3, descargas: 7 });
  assert.equal(llamadas[0].url, 'https://x.supabase.co/rest/v1/rpc/registrar_evento');
  assert.equal(llamadas[0].opciones.method, 'POST');
  assert.deepEqual(JSON.parse(llamadas[0].opciones.body), { p_fondo: '1-recepcion', p_tipo: 'me_gusta' });
});

test('una respuesta con error se propaga como excepción', async () => {
  const { fetch } = falso({ ok: false, status: 404, json: async () => ({ message: 'no existe' }) });
  const api = crearApi({ url: 'https://x.supabase.co', key: 'clave', fetch });
  await assert.rejects(api.conteos(), /404/);
});
