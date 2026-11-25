/**
 * Clave de un fondo en la base de datos y en el DOM.
 * @param {{n: string, id: string}} fondo número de archivo e id de escena
 * @returns {string} por ejemplo "2b3-arcos-azules"
 */
export const idFondo = (fondo) => `${fondo.n}-${fondo.id}`;

/**
 * Rutas relativas de las tres versiones de un fondo.
 * @param {{n: string, id: string}} fondo
 * @param {'izq'|'der'} lado esquina donde queda el logo
 * @returns {{mini: string, hd: string, k4: string}}
 */
export function archivos(fondo, lado) {
  const base = `metaxis-fondo-${fondo.n}-${fondo.id}-logo-${lado}`;
  return { mini: `mini/${base}.jpg`, hd: `hd/${base}.jpg`, k4: `4k/${base}-4k.jpg` };
}

/**
 * Aplana el catálogo por familias a las filas que guarda la tabla fondos.
 * @param {Array<{familia: string, fondos: Array<object>}>} catalogo
 * @returns {Array<{id: string, codigo: string, nombre: string, familia: string, orden: number}>}
 */
export function listaPlana(catalogo) {
  return catalogo
    .flatMap(({ familia, fondos }) => fondos.map((f) => ({ id: idFondo(f), codigo: f.codigo, nombre: f.nombre, familia })))
    .map((fila, i) => ({ ...fila, orden: i + 1 }));
}
