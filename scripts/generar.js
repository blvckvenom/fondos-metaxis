import { idFondo, archivos, listaPlana } from '../src/catalogo.js';

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function tarjeta(f, perezosa) {
  const a = archivos(f, 'izq');
  return `      <article class="card" data-fondo="${idFondo(f)}" data-n="${f.n}" data-id="${f.id}">
        <div class="frame"><img src="${a.mini}" width="960" height="540"${perezosa ? ' loading="lazy"' : ''} alt="${esc(`${f.nombre}. ${f.descripcion}`)}"><svg class="persona" viewBox="0 0 1920 1080" aria-hidden="true"><use href="#persona"/></svg></div>
        <h3>${esc(f.codigo)}. ${esc(f.nombre)}</h3>
        <p class="desc">${esc(f.descripcion)}</p>
        <div class="act"><a class="bajar" data-res="hd" href="${a.hd}" download>Descargar HD</a><a class="bajar alt" data-res="4k" href="${a.k4}" download>4K</a><button type="button" class="gusta" aria-pressed="false" hidden>Me gusta <span class="n">0</span></button></div>
        <p class="bajadas" hidden></p>
      </article>`;
}

/**
 * HTML de la galería: una sección por familia y una tarjeta por fondo (logo a la izquierda por defecto).
 * @param {Array<{familia: string, descripcion: string, fondos: Array<object>}>} catalogo
 * @returns {string}
 */
export function construirGaleria(catalogo) {
  return catalogo.map(({ familia, descripcion, fondos }, i) => `    <section class="familia">
      <div class="fam-head"><h2>${esc(familia)}</h2><p>${esc(descripcion)}</p></div>
      <div class="grid">
${fondos.map((f) => tarjeta(f, i > 0)).join('\n')}
      </div>
    </section>`).join('\n');
}

/**
 * Módulo de configuración que el sitio importa en el navegador.
 * Sin variables de entorno exporta null y el sitio funciona sin contadores.
 * @param {Record<string, string|undefined>} env
 * @returns {string} código fuente de config.js
 */
export function configJs(env) {
  const ok = env.SUPABASE_URL && env.SUPABASE_ANON_KEY;
  return `export const SUPABASE_URL = ${ok ? JSON.stringify(env.SUPABASE_URL) : null};\nexport const SUPABASE_KEY = ${ok ? JSON.stringify(env.SUPABASE_ANON_KEY) : null};\n`;
}

/**
 * SQL que sincroniza la tabla fondos con el catálogo sin tocar los contadores.
 * @param {Array<object>} catalogo
 * @returns {string}
 */
export function sqlSemilla(catalogo) {
  const q = (t) => `'${String(t).replace(/'/g, "''")}'`;
  const filas = listaPlana(catalogo).map((f) => `  (${q(f.id)}, ${q(f.codigo)}, ${q(f.nombre)}, ${q(f.familia)}, ${f.orden})`);
  return `insert into public.fondos (id, codigo, nombre, familia, orden) values\n${filas.join(',\n')}\non conflict (id) do update set codigo = excluded.codigo, nombre = excluded.nombre, familia = excluded.familia, orden = excluded.orden;\n`;
}
