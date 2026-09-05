"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvToJson = csvToJson;
const MAX_NESTING_DEPTH = 100;
const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
function csvToJson(csv, delimiter = ',') {
    if (!csv)
        throw new Error("Empty CSV");
    const parsed = parseRows(csv, delimiter);
    if (parsed.length <= 1)
        throw new Error("File must have at least 2 rows. 1st row contains headers.");
    const compiledHeaders = compileHeaders(parsed[0].values);
    const data = [];
    for (let i = 1; i < parsed.length; i++) {
        const row = parsed[i];
        // skip entirely blank trailing rows
        if (row.values.length === 1 && row.values[0] === '' && !row.quoted[0])
            break;
        data.push(generateJson(compiledHeaders, row.values, row.quoted));
    }
    return data;
}
/**
 * Single-pass parser: walks the whole CSV string character by character,
 * respecting RFC-4180 quoting rules.
 *
 * - A `\n` (or `\r\n`) **inside** quotes is part of the cell value.
 * - A `\n` (or `\r\n`) **outside** quotes ends the current row.
 *
 * This replaces the old `csv.split('\n')` + `tokenize(row)` two-pass approach:
 * every character is visited exactly once, and no intermediate row-string array
 * is allocated, which makes it both correct for multiline cells and faster.
 */
function parseRows(csv, delimiter) {
    const rows = [];
    const n = csv.length;
    let i = 0;
    while (i <= n) {
        // Start a new row
        const values = [];
        const quoted = [];
        while (i <= n) {
            if (i === n || (csv[i] === '\n' && values.length === 0 && quoted.length === 0)) {
                // Edge-case: newline before any cell on this row — shouldn't happen in
                // well-formed CSV, but guard anyway by breaking to push an empty row.
                break;
            }
            if (csv[i] === '"') {
                // --- Quoted cell ---
                i++; // skip opening quote
                let start = i;
                let out = '';
                let closed = false;
                while (i < n) {
                    if (csv[i] === '"') {
                        if (i + 1 < n && csv[i + 1] === '"') {
                            // Escaped quote ("")
                            out += csv.slice(start, i) + '"';
                            i += 2;
                            start = i;
                            continue;
                        }
                        out += csv.slice(start, i);
                        i++;
                        closed = true;
                        break;
                    }
                    i++;
                }
                if (!closed) {
                    out += csv.slice(start, i);
                }
                // Skip anything between closing quote and next delimiter / row-end
                while (i < n && csv[i] !== delimiter && csv[i] !== '\n' && csv[i] !== '\r')
                    i++;
                values.push(out.trim());
                quoted.push(true);
            }
            else {
                // --- Unquoted cell ---
                const start = i;
                while (i < n && csv[i] !== delimiter && csv[i] !== '\n' && csv[i] !== '\r')
                    i++;
                values.push(csv.slice(start, i).trim());
                quoted.push(false);
            }
            // Consume delimiter or row terminator
            if (i < n && csv[i] === delimiter) {
                i++; // move past delimiter, continue reading cells in this row
                // If delimiter is the very last char, push a trailing empty cell
                if (i === n || csv[i] === '\n' || csv[i] === '\r') {
                    values.push('');
                    quoted.push(false);
                    break;
                }
            }
            else {
                // \r\n, \n, or end-of-string — row is done
                break;
            }
        }
        if (values.length > 0) {
            rows.push({ values, quoted });
        }
        // Advance past \r\n or \n
        if (i < n && csv[i] === '\r')
            i++;
        if (i < n && csv[i] === '\n')
            i++;
        else
            break; // end of string
    }
    return rows;
}
/** null = skip this column (dangerous path keys). */
function compileHeaders(headers) {
    const compiled = new Array(headers.length);
    for (let i = 0; i < headers.length; i++) {
        const segments = headers[i].split('.');
        if (segments.length - 1 >= MAX_NESTING_DEPTH) {
            throw new Error("Maximum nesting depth exceeded");
        }
        let dangerous = false;
        for (let s = 0; s < segments.length; s++) {
            if (DANGEROUS_KEYS.has(segments[s])) {
                dangerous = true;
                break;
            }
        }
        compiled[i] = dangerous ? null : segments;
    }
    return compiled;
}
function generateJson(compiledHeaders, values, quoted) {
    if (compiledHeaders.length <= 0)
        return;
    const json = Object.create(null);
    for (let i = 0; i < compiledHeaders.length; i++) {
        const segments = compiledHeaders[i];
        if (!segments || !values[i])
            continue;
        assignPath(json, segments, convertData(values[i], quoted[i]));
    }
    return json;
}
function assignPath(json, segments, value) {
    let current = json;
    const last = segments.length - 1;
    for (let i = 0; i < last; i++) {
        const key = segments[i];
        let next = current[key];
        if (!next) {
            next = Object.create(null);
            current[key] = next;
        }
        current = next;
    }
    current[segments[last]] = value;
}
function convertData(data, wasQuoted) {
    if (wasQuoted) {
        // Quoted cells stay strings (e.g. "404", "true").
        return data;
    }
    if (!isNaN(Number(data))) {
        return +data;
    }
    else if (data === 'true') {
        return true;
    }
    else if (data === 'false') {
        return false;
    }
    else {
        return data;
    }
}
