# API reference

Public surface as exported from `lib/index.ts` (package entry `dist/index.js`).

```js
const csv = require('csv-tools');
// or
import * as csv from 'csv-tools';
```

## `toJSON(csvData[, delimiter])`

Converts a CSV string into an array of objects.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `csvData` | `string` | — | Full CSV text. First row must be headers. |
| `delimiter` | `string` | `','` | Column separator. |

**Returns:** `any[]` — one object per non-empty data row.

**Throws:**

- `Error("Empty CSV")` if `csvData` is falsy.
- `Error("File must have at least 2 rows. 1st row contains headers.")` if there is not at least one header row and one data row.

**Notes:**

- Header names are trimmed; dotted names create nested objects.
- See [architecture.md](architecture.md) for tokenization and type coercion rules.

```js
csv.toJSON('first,last\n"Ada","Lovelace"');
// → [{ first: 'Ada', last: 'Lovelace' }]

csv.toJSON('a;b\n1;2', ';');
// → [{ a: 1, b: 2 }]
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

**Notes:**

- Nested objects become dotted headers.
- Headers are always quoted in the output header line.
- Objects missing a header produce an empty cell for that column.

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
