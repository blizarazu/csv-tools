"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvToJson = csvToJson;
const MAX_NESTING_DEPTH = 100;
const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
function csvToJson(csv, delimiter = ',') {
    if (!csv)
        throw new Error("Empty CSV");
    const data = [];
    const rows = csv.split('\n');
    if (rows.length <= 1)
        throw new Error("File must have at least 2 rows. 1st row contains headers.");
    const headerTokens = tokenize(rows[0], delimiter);
    const compiledHeaders = compileHeaders(headerTokens.values);
    for (let i = 1; i < rows.length; i++) {
        if (rows[i].length <= 0)
            break;
        const rowTokens = tokenize(rows[i], delimiter);
        data.push(generateJson(compiledHeaders, rowTokens.values, rowTokens.quoted));
    }
    return data;
}
function tokenize(row, delimiter) {
    const values = [];
    const quoted = [];
    let i = 0;
    const n = row.length;
    while (i < n) {
        if (row[i] === '"') {
            i++; // skip opening quote
            let start = i;
            let out = '';
            let closed = false;
            while (i < n) {
                if (row[i] === '"') {
                    if (i + 1 < n && row[i + 1] === '"') {
                        out += row.slice(start, i) + '"';
                        i += 2;
                        start = i;
                        continue;
                    }
                    out += row.slice(start, i);
                    i++;
                    closed = true;
                    break;
                }
                i++;
            }
            if (!closed) {
                out += row.slice(start, i);
            }
            while (i < n && row[i] !== delimiter)
                i++;
            values.push(out.trim());
            quoted.push(true);
            if (i < n && row[i] === delimiter)
                i++;
        }
        else {
            const start = i;
            while (i < n && row[i] !== delimiter)
                i++;
            values.push(row.slice(start, i).trim());
            quoted.push(false);
            if (i < n && row[i] === delimiter)
                i++;
        }
    }
    if (n > 0 && row[n - 1] === delimiter) {
        values.push('');
        quoted.push(false);
    }
    return { values, quoted };
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
