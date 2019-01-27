import * as fs from 'fs';

export function csvToJson(csv: string, delimiter?: string): any[] {
  delimiter = delimiter || ',';

  const data = [];
  const rows = csv.split('\n');
  if (rows.length <= 1)
    throw new Error("File must have at least 2 rows. 1st row contains headers.");

  // Split the headers and remove the trailing and leading spaces of each header
  const headers = rows[0].trim().split(new RegExp(`\\s*${delimiter}\\s*`));
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].length <= 0) break;

    const values = rows[i].split(delimiter);
    data.push(generateJson(headers, values));
  }

  return data;
}

function generateJson(fields: string[], data: string[]): any {
  if (fields.length <= 0) return;

  const json = {};
  for (const i in fields) {
    if (data[i]) {
      const field = removeQuotes(fields[i]);
      const value = data[i];
      recursiveJson(field, value, json);
    }
  }
  return json;
}

function recursiveJson(field: string, data: string, json: any): any {
  if (field.length <= 0) return json;

  const fieldArray = field.split('.');
  if (fieldArray.length == 1) {
    // json[fieldArray[0]] = data; // This line saves all data as string
    json[fieldArray[0]] = convertData(data);
  } else {
    const newField = fieldArray.shift();
    if (newField) {
      const jsonObj = json[newField] || {};
      json[newField] = recursiveJson(fieldArray.join('.'), data, jsonObj);
    }
  }
  return json;
}

function convertData(data: string) {
  if (!isNaN(Number(data))) {
    // If the data is numeric, return the data converted to number.
    return +data;
  } else if (data === 'true') {
    //  Else return a boolean true if the value is true without quotes
    return true;
  } else if (data === 'false') {
    // or false if the value is false without quotes
    return false;
  } else {
    // Else return a string without the extra quotes.
    return removeQuotes(data);
  }
}

function removeQuotes(value: string): string {
  return value.replace(/^"(.*)"$/, '$1'); // Remove leading and trailing quotes
}

export function csvFileToJson(filePath: string, delimiter?: string) {
  // If no delimiter was passed, set comma (,) by default
  delimiter = delimiter || ',';

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", function (err, csv) {
      if (err) return reject(err);

      return resolve(csvToJson(csv, delimiter));
    });
  });
}