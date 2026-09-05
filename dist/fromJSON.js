"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonArrayToCsv = jsonArrayToCsv;
const MAX_NESTING_DEPTH = 100;
const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const FORMULA_PREFIX = /^[=+\-@]/;
function jsonArrayToCsv(jsonArray, delimiter = ',') {
    if (!jsonArray || jsonArray.length <= 0)
        throw new Error("The array must contain at least one JSON object");
    const data = [];
    const headers = [];
    for (let i = 0; i < jsonArray.length; i++) {
        const jsonObject = jsonArray[i];
        data[i] = Object.create(null);
        const keys = Object.keys(jsonObject);
        for (let k = 0; k < keys.length; k++) {
            const prop = keys[k];
            if (DANGEROUS_KEYS.has(prop))
                continue;
            const headerArray = [];
            propToHeader(jsonObject[prop], prop, headerArray, data[i], new WeakSet(), 0);
            for (let j = 0; j < headerArray.length; j++) {
                const header = headerArray[j];
                if (headers.indexOf(header) == -1)
                    headers.push(header);
            }
        }
    }
    let result = headers.map(item => `"${String(item).replace(/"/g, '""')}"`).join(delimiter) + "\n";
    for (let z = 0; z < data.length; z++) {
        let row = "";
        for (let k = 0; k < headers.length; k++) {
            const key = headers[k];
            let value = data[z][key];
            if (k > 0)
                row += delimiter;
            if (value !== undefined && value !== null) {
                if (typeof value == "string") {
                    if (FORMULA_PREFIX.test(value)) {
                        value = "'" + value;
                    }
                    value = value.replace(/"/g, '""');
                    value = `"${value}"`;
                }
                row += value;
            }
        }
        result += row;
        if (z < data.length - 1)
            result += "\n";
    }
    return result;
}
function propToHeader(jsonObject, parents, headerArray, dataArray, seen, depth) {
    if (jsonObject === null || typeof jsonObject !== "object") {
        headerArray.push(parents);
        dataArray[parents] = jsonObject;
        return;
    }
    if (depth >= MAX_NESTING_DEPTH) {
        throw new Error("Maximum nesting depth exceeded");
    }
    if (seen.has(jsonObject)) {
        throw new Error("Circular reference detected");
    }
    seen.add(jsonObject);
    const keys = Object.keys(jsonObject);
    for (let i = 0; i < keys.length; i++) {
        const p = keys[i];
        if (DANGEROUS_KEYS.has(p))
            continue;
        propToHeader(jsonObject[p], `${parents}.${p}`, headerArray, dataArray, seen, depth + 1);
    }
}
