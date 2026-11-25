// Imprime el SQL que sincroniza la tabla fondos con src/catalogo.json.
// Uso: node scripts/semilla.js > supabase/migrations/<fecha>_semilla_fondos.sql
import { readFileSync } from 'node:fs';
import { sqlSemilla } from './generar.js';

const catalogo = JSON.parse(readFileSync(new URL('../src/catalogo.json', import.meta.url)));
process.stdout.write(`-- Fondos del catálogo (generado con scripts/semilla.js; no modifica contadores).\n${sqlSemilla(catalogo)}`);
