/**
 * Marca o desmarca un fondo como favorito de este navegador.
 * @param {string[]} ids fondos ya marcados
 * @param {string} id fondo pulsado
 * @returns {{ids: string[], evento: 'me_gusta'|'quitar_me_gusta'}} lista nueva y evento a registrar
 */
export function alternar(ids, id) {
  return ids.includes(id)
    ? { ids: ids.filter((x) => x !== id), evento: 'quitar_me_gusta' }
    : { ids: [...ids, id], evento: 'me_gusta' };
}

/**
 * Indexa por id las filas de contadores que devuelve la base.
 * @param {Array<{id: string, me_gusta: number, descargas: number}>} filas
 * @returns {Record<string, {me_gusta: number, descargas: number}>}
 */
export const conteosPorId = (filas) =>
  Object.fromEntries(filas.map(({ id, me_gusta, descargas }) => [id, { me_gusta, descargas }]));
