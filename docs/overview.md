# Overview

**csv-tools** converts CSV text to JSON arrays and JSON arrays back to CSV. It is aimed at Node.js applications that need a small, dependency-free conversion layer between tabular CSV and object trees.

## What it does

- **CSV → JSON** (`toJSON`): parses a CSV string whose first row is headers; each following row becomes an object.
- **JSON → CSV** (`fromJSON`): flattens an array of objects into CSV, using dotted headers for nested properties.
- **Custom delimiter**: both directions accept an optional delimiter (default `,`). Semicolon and other single-character separators are supported the same way.
- **Nested fields**: a header like `owner.name.first` becomes (or is produced from) nested objects.
- **Value coercion (CSV → JSON)**: unquoted numerics become numbers; the bare tokens `true` / `false` become booleans; other values become strings (quotes stripped when present).

## What it does not do (current source)

- It does not stream large files; input is held as a full string or in-memory array.
- It does not validate schema consistency beyond collecting headers from objects present in the array.
- `fileToJSON` appears in the root README but is **not** part of the current TypeScript API. Use `fs.readFile` (or similar) and then `toJSON` if you need file input.

## Install

```bash
npm install csv-tools
```

## Minimal usage

```js
const csv = require('csv-tools');

const rows = csv.toJSON('a,b\n1,2');
// → [{ a: 1, b: 2 }]

const text = csv.fromJSON([{ a: 1, b: 2 }]);
// → "a","b"\n1,2
```

See [api.md](api.md) for full signatures and [architecture.md](architecture.md) for conversion rules.
