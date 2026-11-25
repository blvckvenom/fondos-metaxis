import { archivos } from './catalogo.js';
import { alternar, conteosPorId } from './estado.js';
import { crearApi } from './api.js';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const galeria = document.getElementById('galeria');
const cards = [...galeria.querySelectorAll('.card')];
const bIzq = document.getElementById('lado-izq'), bDer = document.getElementById('lado-der');
const chk = document.getElementById('ver-persona');

// localStorage puede no existir (modo privado, almacenamiento bloqueado) o traer datos ajenos a este formato.
const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const leer = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
function leerLista(k) {
  try { const v = JSON.parse(leer(k)); return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []; } catch (e) { return []; }
}

let lado = leer('fondos-lado') === 'der' ? 'der' : 'izq';
let gustados = leerLista('fondos-megusta');
let conteos = {};

function pintarLado() {
  bIzq.setAttribute('aria-pressed', String(lado === 'izq'));
  bDer.setAttribute('aria-pressed', String(lado === 'der'));
  cards.forEach((card) => {
    const a = archivos({ n: card.dataset.n, id: card.dataset.id }, lado);
    card.querySelector('img').src = a.mini;
    card.querySelector('[data-res="hd"]').href = a.hd;
    card.querySelector('[data-res="4k"]').href = a.k4;
  });
}
function setLado(l) { lado = l; guardar('fondos-lado', l); pintarLado(); }
bIzq.addEventListener('click', () => setLado('izq'));
bDer.addEventListener('click', () => setLado('der'));
chk.addEventListener('change', () => { galeria.classList.toggle('con-persona', chk.checked); guardar('fondos-persona', chk.checked ? '1' : '0'); });
if (leer('fondos-persona') === '1') { chk.checked = true; galeria.classList.add('con-persona'); }
pintarLado();

function pintarConteo(card) {
  const c = conteos[card.dataset.fondo];
  if (!c) return;
  const boton = card.querySelector('.gusta'), bajadas = card.querySelector('.bajadas');
  boton.hidden = false;
  boton.setAttribute('aria-pressed', String(gustados.includes(card.dataset.fondo)));
  boton.querySelector('.n').textContent = c.me_gusta;
  bajadas.hidden = c.descargas === 0;
  bajadas.textContent = c.descargas === 1 ? '1 descarga' : `${c.descargas} descargas`;
}

// Sin conexión configurada, o si la base no responde, la galería funciona igual sin contadores.
if (SUPABASE_URL) {
  const api = crearApi({ url: SUPABASE_URL, key: SUPABASE_KEY });
  api.conteos().then((filas) => {
    conteos = conteosPorId(filas);
    cards.forEach((card) => {
      const id = card.dataset.fondo;
      pintarConteo(card);
      card.querySelector('.gusta').addEventListener('click', () => {
        const previo = { gustados, conteo: conteos[id] };
        const { ids, evento } = alternar(gustados, id);
        gustados = ids;
        conteos[id] = { ...previo.conteo, me_gusta: Math.max(0, previo.conteo.me_gusta + (evento === 'me_gusta' ? 1 : -1)) };
        pintarConteo(card);
        api.registrar(id, evento)
          .then((c) => { conteos[id] = c; guardar('fondos-megusta', JSON.stringify(gustados)); })
          .catch(() => { gustados = previo.gustados; conteos[id] = previo.conteo; })
          .finally(() => pintarConteo(card));
      });
      card.querySelectorAll('.bajar').forEach((a) => a.addEventListener('click', () => {
        api.registrar(id, 'descarga').then((c) => { conteos[id] = c; pintarConteo(card); }).catch(() => {});
      }));
    });
  }).catch(() => {});
}
