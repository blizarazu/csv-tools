#!/usr/bin/env node
/**
 * benchmark.cjs — benchmark de rendimiento para csv-tools.
 *
 * Modos de uso
 * ────────────
 * Modo normal  (una dist, salida JSON + tabla):
 *   node scripts/benchmark.cjs [label]
 *   CSV_TOOLS_DIST=/ruta/dist node scripts/benchmark.cjs [label]
 *
 * Modo comparación antes/después (requiere dist-old/ y dist-new/ en la raíz):
 *   node scripts/benchmark.cjs --compare
 *
 * Para generar dist-old y dist-new:
 *   cp -r dist dist-new
 *   git stash && npm run build && cp -r dist dist-old
 *   git stash pop && npm run build
 */

'use strict';
const path             = require('path');
const fs               = require('fs');
const { execFileSync } = require('child_process');

const root        = path.join(__dirname, '..');
const COMPARE_MODE = process.argv.includes('--compare');
const ITER         = COMPARE_MODE ? 500 : 200;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeWideCsv(rows) {
  const header = 'a,b,c,d,e,f.a,f.b,f.c.a,f.c.b,g.a.b.c';
  const line   = '1,2,3,4,5,6,7,8,9,0';
  return [header, ...Array.from({ length: rows }, () => line)].join('\n');
}

function makeQuotedCsv(rows) {
  const header = '"department","workers","note"';
  const line   = '"Sales","Arlee Sowerby,Lion Gledhall","length: 202.8"", height:68.9"""';
  return [header, ...Array.from({ length: rows }, () => line)].join('\n');
}

function makeMultilineCsv(rows) {
  const header = 'title,notes,score';
  const lines  = [header];
  for (let i = 0; i < rows; i++)
    lines.push(`"Title${i}","Line1 of note\nLine2 of note",${i}`);
  return lines.join('\n');
}

const nestedHeader = Array.from({ length: 20 }, (_, i) => `n${i}`).join('.');
const nestedCsv    = `${nestedHeader}\n1`;

// ─── Harness ──────────────────────────────────────────────────────────────────

function bench(name, fn) {
  fn(); fn(); fn(); // warm-up
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < ITER; i++) fn();
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  return { name, totalMs: ms, perOpMs: ms / ITER };
}

// ─── Modo normal ──────────────────────────────────────────────────────────────

function runNormal() {
  const distPath = process.env.CSV_TOOLS_DIST
    ? path.resolve(process.env.CSV_TOOLS_DIST)
    : path.join(root, 'dist');
  const { toJSON, fromJSON } = require(distPath);

  const label      = process.argv.find(a => a !== '--compare' && !a.startsWith('-') && a !== process.execPath && a !== __filename) || 'run';
  const sampleJson = toJSON(makeWideCsv(50));

  const suites = [
    bench('toJSON_wide_500rows',      () => toJSON(makeWideCsv(500))),
    bench('toJSON_quoted_200rows',    () => toJSON(makeQuotedCsv(200))),
    bench('toJSON_multiline_200rows', () => toJSON(makeMultilineCsv(200))),
    bench('toJSON_nested_20',         () => toJSON(nestedCsv)),
    bench('fromJSON_50objs',          () => fromJSON(sampleJson)),
  ];

  const out = { label, node: process.version, iterations: ITER, suites, totalMs: suites.reduce((s, x) => s + x.totalMs, 0) };
  console.log(JSON.stringify(out, null, 2));
  for (const s of suites)
    process.stderr.write(`${label}\t${s.name}\t${s.totalMs.toFixed(2)}ms\t${s.perOpMs.toFixed(3)}ms/op\n`);
}

// ─── Modo comparación ─────────────────────────────────────────────────────────

function runInSubprocess(distPath) {
  const fixtures = `
    ${makeWideCsv.toString()}
    ${makeQuotedCsv.toString()}
    ${makeMultilineCsv.toString()}
    const nestedHeader = Array.from({ length: 20 }, (_, i) => 'n' + i).join('.');
    const nestedCsv    = nestedHeader + '\\n1';
  `;
  const script = `
    'use strict';
    const { toJSON, fromJSON } = require(${JSON.stringify(distPath)});
    const ITER = ${ITER};
    ${fixtures}
    const sampleJson = toJSON(makeWideCsv(50));

    function bench(name, fn) {
      fn(); fn(); fn();
      const t0 = process.hrtime.bigint();
      for (let i = 0; i < ITER; i++) fn();
      const ms = Number(process.hrtime.bigint() - t0) / 1e6;
      return { name, perOpMs: ms / ITER };
    }

    process.stdout.write(JSON.stringify([
      bench('toJSON_wide_500rows',      () => toJSON(makeWideCsv(500))),
      bench('toJSON_quoted_200rows',    () => toJSON(makeQuotedCsv(200))),
      bench('toJSON_multiline_200rows', () => toJSON(makeMultilineCsv(200))),
      bench('toJSON_nested_20',         () => toJSON(nestedCsv)),
      bench('fromJSON_50objs',          () => fromJSON(sampleJson)),
    ]));
  `;
  return JSON.parse(execFileSync(process.execPath, ['-e', script], { cwd: root, encoding: 'utf8' }));
}

function runCompare() {
  const oldDist = path.join(root, 'dist-old');
  const newDist = path.join(root, 'dist-new');

  process.stderr.write(`\nBenchmark antes/después — ${ITER} iteraciones, subprocesos independientes\n\n`);
  process.stderr.write('  Midiendo BEFORE (dist-old)...\n');
  const before = runInSubprocess(oldDist);
  process.stderr.write('  Midiendo AFTER  (dist-new)...\n');
  const after  = runInSubprocess(newDist);

  const COL = 32;
  console.log(`\n  ${'Suite'.padEnd(COL)} ${'BEFORE ms/op'.padStart(12)}   ${'AFTER ms/op'.padStart(12)}   ${'Δ %'.padStart(8)}   Veredicto`);
  console.log('  ' + '─'.repeat(COL + 56));

  for (let i = 0; i < before.length; i++) {
    const b   = before[i].perOpMs;
    const a   = after[i].perOpMs;
    const pct = (a - b) / b * 100;
    const verdict = pct < 0 ? `▼ ${(-pct).toFixed(1)}% faster` : `▲ ${pct.toFixed(1)}% slower`;
    console.log(`  ${before[i].name.padEnd(COL)} ${b.toFixed(3).padStart(12)}   ${a.toFixed(3).padStart(12)}   ${pct.toFixed(1).padStart(7)}%   ${verdict}`);
  }
  console.log('');

  // Limpiar snapshots temporales para que no se cuelen en un commit accidental
  for (const d of [oldDist, newDist]) {
    if (fs.existsSync(d)) {
      fs.rmSync(d, { recursive: true, force: true });
      process.stderr.write(`  Eliminado ${path.relative(root, d)}/\n`);
    }
  }
}

// ─── Entry point ──────────────────────────────────────────────────────────────

if (COMPARE_MODE) runCompare();
else              runNormal();
