"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.csvToJson = void 0;
function csvToJson(csv, delimiter) {
    if (delimiter === void 0) { delimiter = ','; }
    if (!csv)
        throw new Error("Empty CSV");
    var data = [];
    var rows = csv.split('\n');
    if (rows.length <= 1)
        throw new Error("File must have at least 2 rows. 1st row contains headers.");
    // Split the headers and remove the trailing and leading spaces of each header
    var headers = tokenize(rows[0], delimiter);
    for (var i = 1; i < rows.length; i++) {
        if (rows[i].length <= 0)
            break;
        var values = tokenize(rows[i], delimiter);
        data.push(generateJson(headers, values));
    }
    return data;
}
exports.csvToJson = csvToJson;
function tokenize(row, delimiter) {
    var regExp = new RegExp("(?:" + delimiter + "|\n|^)(\"(?:(?:\"\")*[^\"]*)*\"|[^\"" + delimiter + "\n]*|(?:\n|$))", "gm");
    var matches = row.match(regExp);
    if (!matches)
        return [];
    if (row[0] === delimiter)
        matches.unshift("");
    return matches.map(function (item) {
        // Remove leading delimeter if there is
        item = item[0] === delimiter ? item.slice(1) : item;
        // Remove leading and trailing whitespaces and replace double quotes by one quote
        return item.trim().replace(/""/g, '"');
    });
}
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
