"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function jsonArrayToCsv(jsonArray, delimiter) {
    if (!jsonArray || jsonArray.length <= 0)
        throw new Error("The array must contain at least one JSON object");
    delimiter = delimiter || ',';
    const data = [];
    const headers = [];
    for (const i in jsonArray) {
        const jsonObject = jsonArray[i];
        data[i] = [];
        for (const prop in jsonObject) {
            const headerArray = [];
            propToHeader(jsonObject[prop], prop, headerArray, data[i]);
            for (const j in headerArray) {
                const header = headerArray[j];
                if (headers.indexOf(header) == -1)
                    headers.push(header);
            }
        }
    }
    let result = headers.join(delimiter) + "\n";
    for (let z = 0; z < data.length; z++) {
        let row = "";
        for (let k = 0; k < headers.length; k++) {
            const key = headers[k];
            let value = data[z][key];
            if (k > 0)
                row += delimiter;
            if (value !== undefined && value !== null) {
                if (typeof value == "string")
                    value = `"${value}"`;
                row += value;
            }
        }
        result += row;
        if (z < data.length - 1)
            result += "\n";
    }
    return result;
}
exports.jsonArrayToCsv = jsonArrayToCsv;
function propToHeader(jsonObject, parents, headerArray, dataArray) {
    if (typeof jsonObject !== "object") {
        headerArray.push(parents);
        dataArray[parents] = jsonObject;
    }
    else {
        for (const p in jsonObject) {
            propToHeader(jsonObject[p], `${parents}.${p}`, headerArray, dataArray);
        }
    }
}
