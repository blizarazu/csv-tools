const MAX_NESTING_DEPTH = 100;
const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export function csvToJson(csv: string, delimiter: string = ','): any[] {
  if (!csv) throw new Error("Empty CSV");

  const data = [];
  const rows = csv.split('\n');
  if (rows.length <= 1)
    throw new Error("File must have at least 2 rows. 1st row contains headers.");

  // Split the headers and remove the trailing and leading spaces of each header
  const headers = tokenize(rows[0], delimiter);
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].length <= 0) break;

    const values = tokenize(rows[i], delimiter)
    data.push(generateJson(headers, values));
  }

  return data;
}

function tokenize(row: string, delimiter: string): string[] {
  const fields: string[] = [];
  let i = 0;
  const n = row.length;

  while (i < n) {
    if (row[i] === '"') {
      let value = '"';
      i++;
      while (i < n) {
        if (row[i] === '"') {
          if (i + 1 < n && row[i + 1] === '"') {
            value += '""';
            i += 2;
            continue;
          }
          value += '"';
          i++;
          break;
        }
        value += row[i];
        i++;
      }
      while (i < n && row[i] !== delimiter) i++;
      fields.push(value.trim().replace(/""/g, '"'));
      if (i < n && row[i] === delimiter) i++;
    } else {
      const start = i;
      while (i < n && row[i] !== delimiter) i++;
      fields.push(row.slice(start, i).trim().replace(/""/g, '"'));
      if (i < n && row[i] === delimiter) i++;
    }
  }

  if (n > 0 && row[n - 1] === delimiter) {
    fields.push('');
  }

  return fields;
}

function generateJson(fields: string[], data: string[]): any {
  if (fields.length <= 0) return;

  const json: Record<string, any> = Object.create(null);
  for (let i = 0; i < fields.length; i++) {
    if (data[i]) {
      const field = removeQuotes(fields[i]);
      const value = data[i];
      recursiveJson(field, value, json, 0);
    }
  }
  return json;
}

function recursiveJson(field: string, data: string, json: any, depth: number): any {
  if (field.length <= 0) return json;
  if (depth >= MAX_NESTING_DEPTH) {
    throw new Error("Maximum nesting depth exceeded");
  }

  const fieldArray = field.split('.');
  if (fieldArray.length == 1) {
    const key = fieldArray[0];
    if (DANGEROUS_KEYS.has(key)) return json;
    json[key] = convertData(data);
  } else {
    const newField = fieldArray.shift();
    if (newField) {
      if (DANGEROUS_KEYS.has(newField)) return json;
      const jsonObj = json[newField] || Object.create(null);
      json[newField] = recursiveJson(fieldArray.join('.'), data, jsonObj, depth + 1);
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
