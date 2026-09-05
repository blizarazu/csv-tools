#!/usr/bin/env node
/**
 * Benchmark toJSON / fromJSON for security-hardening comparison.
 * Usage: CSV_TOOLS_DIST=/path/to/dist node scripts/bench-security.cjs [label]
 */
const path = require('path');
const distPath = process.env.CSV_TOOLS_DIST
  ? path.resolve(process.env.CSV_TOOLS_DIST)
  : path.join(__dirname, '..', 'dist');
const { toJSON, fromJSON } = require(distPath);

const label = process.argv[2] || 'run';
const ITER = 200;

function makeWideCsv(rows) {
  const header = 'a,b,c,d,e,f.a,f.b,f.c.a,f.c.b,g.a.b.c';
  const line = '1,2,3,4,5,6,7,8,9,0';
  return [header, ...Array.from({ length: rows }, () => line)].join('\n');
}

function makeQuotedCsv(rows) {
  const header = '"department","workers","note"';
  const line =
    '"Sales","Arlee Sowerby,Lion Gledhall","length: 202.8"", height:68.9"""';
  return [header, ...Array.from({ length: rows }, () => line)].join('\n');
}

const nestedHeader = Array.from({ length: 20 }, (_, i) => `n${i}`).join('.');
const nestedCsv = `${nestedHeader}\n1`;

const sampleJson = toJSON(makeWideCsv(50));

function bench(name, fn) {
  fn(); // warmup
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < ITER; i++) fn();
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  return { name, totalMs: ms, perOpMs: ms / ITER };
}

const suites = [
  bench('toJSON_wide_500rows', () => toJSON(makeWideCsv(500))),
  bench('toJSON_quoted_200rows', () => toJSON(makeQuotedCsv(200))),
  bench('toJSON_nested_20', () => toJSON(nestedCsv)),
  bench('fromJSON_50objs', () => fromJSON(sampleJson)),
];

const out = {
  label,
  node: process.version,
  iterations: ITER,
  suites,
  totalMs: suites.reduce((s, x) => s + x.totalMs, 0),
};

console.log(JSON.stringify(out, null, 2));
for (const s of suites) {
  console.error(
    `${label}\t${s.name}\t${s.totalMs.toFixed(2)}ms\t${s.perOpMs.toFixed(3)}ms/op`
  );
}
