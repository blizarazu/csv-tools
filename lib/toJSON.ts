const MAX_NESTING_DEPTH = 100;
const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

/**
 * Error thrown when strict RFC 4180 validation fails.
 * Includes the line and column where the violation was detected.
 */
export class CsvParseError extends Error {
  public readonly line: number;
  public readonly column: number;

  constructor(message: string, line: number, column: number) {
    super(`RFC 4180 violation at line ${line}, col ${column}: ${message}`);
    this.name = 'CsvParseError';
    this.line = line;
    this.column = column;
  }
}

export interface CsvToJsonOptions {
  /** Optional delimiter when the options object is used as the second argument. */
  delimiter?: string;
  /** Preserve leading and trailing spaces in header names. Defaults to false. */
  preserveHeaderSpaces?: boolean;
  /** Preserve leading and trailing spaces in field values. Defaults to false. */
  preserveValueSpaces?: boolean;
  /** When true, reject CSV that does not conform to the RFC 4180 ABNF grammar. */
  strict?: boolean;
}

/** @deprecated Use CsvToJsonOptions. */
export type ToJsonOptions = CsvToJsonOptions;

export function csvToJson(csv: string, options?: CsvToJsonOptions): any[];
export function csvToJson(csv: string, delimiter?: string, options?: CsvToJsonOptions): any[];
export function csvToJson(
  csv: string,
  delimiterOrOptions: string | CsvToJsonOptions = ',',
  options: CsvToJsonOptions = {}
): any[] {
  if (!csv) throw new Error("Empty CSV");

  const parseOptions = typeof delimiterOrOptions === 'string' ? options : delimiterOrOptions;
  const delimiter = typeof delimiterOrOptions === 'string'
    ? delimiterOrOptions
    : parseOptions.delimiter ?? ',';
  const strict = parseOptions.strict ?? false;

  if (strict && delimiter !== ',') {
    throw new CsvParseError('RFC 4180 requires comma (,) as delimiter', 1, 0);
  }

  const parsed = parseRows(csv, delimiter, strict);
  if (parsed.length <= 1)
    throw new Error("File must have at least 2 rows. 1st row contains headers.");

  const compiledHeaders = compileHeaders(parsed[0].values.map(header =>
    strict || parseOptions.preserveHeaderSpaces ? header : header.trim()
  ));

  if (strict) {
    const expectedFields = parsed[0].values.length;
    for (let r = 1; r < parsed.length; r++) {
      const row = parsed[r];
      if (row.values.length === 1 && row.values[0] === '' && !row.quoted[0]) continue;
      if (row.values.length !== expectedFields) {
        throw new CsvParseError(
          `Row has ${row.values.length} field(s), expected ${expectedFields}`,
          r + 1, 0
        );
      }
    }
  }
  const data = [];

  for (let i = 1; i < parsed.length; i++) {
    const row = parsed[i];
    // skip entirely blank trailing rows
    if (row.values.length === 1 && row.values[0] === '' && !row.quoted[0]) break;
    const values = strict || parseOptions.preserveValueSpaces
      ? row.values
      : row.values.map(value => value.trim());
    data.push(generateJson(compiledHeaders, values, row.quoted));
  }

  return data;
}

interface TokenizeResult {
  values: string[];
  quoted: boolean[];
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
function parseRows(csv: string, delimiter: string, strict: boolean): TokenizeResult[] {
  const rows: TokenizeResult[] = [];
  const n = csv.length;
  let i = 0;
  let currentLine = 1;
  let lineStart = 0;

  while (i <= n) {
    // Start a new row
    const values: string[] = [];
    const quoted: boolean[] = [];

    while (i <= n) {
      if (i === n || (csv[i] === '\n' && values.length === 0 && quoted.length === 0)) {
        // Edge-case: newline before any cell on this row — shouldn't happen in
        // well-formed CSV, but guard anyway by breaking to push an empty row.
        break;
      }

      if (csv[i] === '"') {
        // --- Quoted cell ---
        const fieldStartCol = i - lineStart;
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
          if (csv[i] === '\n') {
            currentLine++;
            lineStart = i + 1;
          }
          i++;
        }
        if (!closed) {
          if (strict) {
            throw new CsvParseError('Unclosed double quote in escaped field', currentLine, fieldStartCol);
          }
          out += csv.slice(start, i);
        }
        if (strict) {
          if (i < n && csv[i] !== delimiter && csv[i] !== '\r' && csv[i] !== '\n') {
            throw new CsvParseError(
              `Unexpected character '${csv[i]}' after closing double quote`,
              currentLine, i - lineStart
            );
          }
        } else {
          while (i < n && csv[i] !== delimiter && csv[i] !== '\n' && csv[i] !== '\r') i++;
        }
        values.push(out);
        quoted.push(true);
      } else {
        // --- Unquoted cell ---
        const start = i;
        while (i < n && csv[i] !== delimiter && csv[i] !== '\n' && csv[i] !== '\r') i++;
        const raw = csv.slice(start, i);
        if (strict) {
          for (let j = 0; j < raw.length; j++) {
            const code = raw.charCodeAt(j);
            const isTextdata = (code >= 0x20 && code <= 0x21)
                            || (code >= 0x23 && code <= 0x2B)
                            || (code >= 0x2D && code <= 0x7E);
            if (!isTextdata) {
              throw new CsvParseError(
                `Invalid character U+${code.toString(16).toUpperCase().padStart(4, '0')} in unquoted field; only TEXTDATA (%x20-21 / %x23-2B / %x2D-7E) is allowed`,
                currentLine, (start + j) - lineStart
              );
            }
          }
        }
        values.push(raw);
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
      } else {
        // \r\n, \n, or end-of-string — row is done
        break;
      }
    }

    if (values.length > 0) {
      rows.push({ values, quoted });
    }

    if (i < n) {
      if (csv[i] === '\r' && i + 1 < n && csv[i + 1] === '\n') {
        i += 2;
        currentLine++;
        lineStart = i;
      } else if (csv[i] === '\n') {
        if (strict) {
          throw new CsvParseError(
            'Record separator must be CRLF (\\r\\n), found bare LF (\\n)',
            currentLine, i - lineStart
          );
        }
        i++;
        currentLine++;
        lineStart = i;
      } else if (csv[i] === '\r') {
        if (strict) {
          throw new CsvParseError(
            'Record separator must be CRLF (\\r\\n), found bare CR (\\r)',
            currentLine, i - lineStart
          );
        }
        i++;
        currentLine++;
        lineStart = i;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return rows;
}

/** null = skip this column (dangerous path keys). */
function compileHeaders(headers: string[]): (string[] | null)[] {
  const compiled: (string[] | null)[] = new Array(headers.length);
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

function generateJson(
  compiledHeaders: (string[] | null)[],
  values: string[],
  quoted: boolean[]
): any {
  if (compiledHeaders.length <= 0) return;

  const json: Record<string, any> = Object.create(null);
  for (let i = 0; i < compiledHeaders.length; i++) {
    const segments = compiledHeaders[i];
    if (!segments || !values[i]) continue;
    assignPath(json, segments, convertData(values[i], quoted[i]));
  }
  return json;
}

function assignPath(json: any, segments: string[], value: any): void {
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

function convertData(data: string, wasQuoted: boolean) {
  if (wasQuoted) {
    // Quoted cells stay strings (e.g. "404", "true").
    return data;
  }
  if (!isNaN(Number(data))) {
    return +data;
  } else if (data === 'true') {
    return true;
  } else if (data === 'false') {
    return false;
  } else {
    return data;
  }
}
