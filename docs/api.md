# API reference

Public surface as exported from `lib/index.ts` (package entry `dist/index.js`).

```js
const csv = require('csv-tools');
// or
import * as csv from 'csv-tools';
```

## `toJSON(csvData[, delimiter][, options])`

Converts a CSV string into an array of objects.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `csvData` | `string` | — | Full CSV text. First row must be headers. |
| `delimiter` | `string` | `','` | Column separator. |
| `options.preserveHeaderSpaces` | `boolean` | `false` | Preserve leading and trailing spaces in header names instead of trimming them. |
| `options.preserveValueSpaces` | `boolean` | `false` | Preserve leading and trailing spaces in field values instead of trimming them. |

**Returns:** `any[]` — one object per non-empty data row.

**Throws:**

- `Error("Empty CSV")` if `csvData` is falsy.
- `Error("File must have at least 2 rows. 1st row contains headers.")` if there is not at least one header row and one data row.
- `Error("Maximum nesting depth exceeded")` if a dotted header is deeper than 100 levels.

**Notes:**

- Header names and field values are trimmed by default, which avoids accidental whitespace in JSON property names and values. Set either preservation option to `true` when exact CSV whitespace is needed.
- Path segments `__proto__`, `prototype`, and `constructor` are ignored (prototype-pollution guard).
- See [architecture.md](architecture.md) for tokenization and type coercion rules.

```js
csv.toJSON('first,last\n"Ada","Lovelace"');
// → [{ first: 'Ada', last: 'Lovelace' }]

csv.toJSON('a;b\n1;2', ';');
// → [{ a: 1, b: 2 }]

csv.toJSON(' name , note \n Ada , hello ', {
  preserveHeaderSpaces: true,
  preserveValueSpaces: true,
});
// → [{ ' name ': ' Ada ', ' note ': ' hello ' }]
```

## `fromJSON(jsonArray[, delimiter])`

Converts an array of objects into a CSV string.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `jsonArray` | `any[]` | — | Non-empty array of row objects. |
| `delimiter` | `string` | `','` | Column separator. |

**Returns:** `string` — CSV text including a header row.

**Throws:**

- `Error("The array must contain at least one JSON object")` if the array is missing or empty.
- `Error("Circular reference detected")` if an object graph contains a cycle.
- `Error("Maximum nesting depth exceeded")` if nesting is deeper than 100 levels.

**Notes:**

- Nested objects become dotted headers.
- Headers are always quoted in the output header line; `"` inside header names is escaped as `""`. Output records use `CRLF` (`\r\n`) line endings.
- Objects missing a header produce an empty cell for that column.
- String values starting with `=`, `+`, `-`, or `@` are prefixed with `'` (spreadsheet formula guard).

```js
csv.fromJSON([
  { age: 21, name: { first: 'Ada', last: 'Lovelace' } },
]);
// → "age","name.first","name.last"\n21,"Ada","Lovelace"
```

## Not in current API

### `fileToJSON`

Documented in the root README historically, but **not exported** from current TypeScript sources. Equivalent pattern:

```js
const fs = require('fs');
const csv = require('csv-tools');

fs.readFile('data.csv', 'utf8', (err, text) => {
  if (err) throw err;
  const json = csv.toJSON(text);
});
```
