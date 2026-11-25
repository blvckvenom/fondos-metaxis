/**
 * Cliente mínimo de la API REST de Supabase para los contadores de fondos.
 * @param {{url: string, key: string, fetch?: typeof fetch}} conexion URL del proyecto y clave pública
 * @returns {{conteos: () => Promise<object[]>, registrar: (id: string, tipo: string) => Promise<{me_gusta: number, descargas: number}>}}
 * @throws {Error} si la API responde con un estado distinto de 2xx
 */
export function crearApi({ url, key, fetch = globalThis.fetch }) {
  const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const pedir = async (ruta, opciones = {}) => {
    const r = await fetch(`${url}/rest/v1/${ruta}`, { ...opciones, headers });
    if (!r.ok) throw new Error(`Supabase respondió ${r.status}`);
    return r.json();
  };
  return {
    conteos: () => pedir('fondos?select=id,me_gusta,descargas'),
    async registrar(id, tipo) {
      // keepalive: el evento de descarga se envía justo antes de que el navegador inicie la bajada
      const [fila] = await pedir('rpc/registrar_evento', { method: 'POST', keepalive: true, body: JSON.stringify({ p_fondo: id, p_tipo: tipo }) });
      return { me_gusta: fila.total_me_gusta, descargas: fila.total_descargas };
    },
  };
}
