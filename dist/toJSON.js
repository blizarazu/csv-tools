"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function csvToJson(csv, delimiter) {
    delimiter = delimiter || ',';
    var data = [];
    var rows = csv.split('\n');
    if (rows.length <= 1)
        throw new Error("File must have at least 2 rows. 1st row contains headers.");
    // Split the headers and remove the trailing and leading spaces of each header
    var headers = rows[0].trim().split(new RegExp("\\s*" + delimiter + "\\s*"));
    for (var i = 1; i < rows.length; i++) {
        if (rows[i].length <= 0)
            break;
        var values = rows[i].split(delimiter);
        data.push(generateJson(headers, values));
    }
    return data;
}
exports.csvToJson = csvToJson;
function generateJson(fields, data) {
    if (fields.length <= 0)
        return;
    var json = {};
    for (var i in fields) {
        if (data[i]) {
            var field = removeQuotes(fields[i]);
            var value = data[i];
            recursiveJson(field, value, json);
        }
    }
    return json;
}
function recursiveJson(field, data, json) {
    if (field.length <= 0)
        return json;
    var fieldArray = field.split('.');
    if (fieldArray.length == 1) {
        // json[fieldArray[0]] = data; // This line saves all data as string
        json[fieldArray[0]] = convertData(data);
    }
    else {
        var newField = fieldArray.shift();
        if (newField) {
            var jsonObj = json[newField] || {};
            json[newField] = recursiveJson(fieldArray.join('.'), data, jsonObj);
        }
    }
    return json;
}
function convertData(data) {
    if (!isNaN(Number(data))) {
        // If the data is numeric, return the data converted to number.
        return +data;
    }
    else if (data === 'true') {
        //  Else return a boolean true if the value is true without quotes
        return true;
    }
    else if (data === 'false') {
        // or false if the value is false without quotes
        return false;
    }
    else {
        // Else return a string without the extra quotes.
        return removeQuotes(data);
    }
}
function removeQuotes(value) {
    return value.replace(/^"(.*)"$/, '$1'); // Remove leading and trailing quotes
}
