# Architecture

## Module layout

```
lib/
  index.ts      # Public exports
  toJSON.ts     # csvToJson → exported as toJSON
  fromJSON.ts   # jsonArrayToCsv → exported as fromJSON
dist/           # tsc output (CommonJS + .d.ts)
```

`lib/index.ts` re-exports:

- `toJSON` from `./toJSON` (`csvToJson`)
- `fromJSON` from `./fromJSON` (`jsonArrayToCsv`)

Build target is ES5 CommonJS (`tsconfig.json`), with declarations written to `dist/`.

## CSV → JSON (`toJSON`)

1. Reject empty input.
2. Split on newlines; require at least a header row and one data row.
3. Tokenize the header row and each data row with a linear, delimiter-literal parser that understands quoted fields and escaped quotes (`""`) — the delimiter is never interpolated into a `RegExp`. Quoted fields are unescaped in a single pass (slice-based, not char-by-char concatenation).
4. Trim tokens by default before compiling header paths; this maintains ergonomic JSON property names. `preserveHeaderSpaces` and `preserveValueSpaces` independently retain the original surrounding whitespace when required. Compile header paths once into segment arrays (reject dangerous keys and excessive depth up front).
5. For each data row, assign values along the precompiled paths iteratively (no per-cell `split`/`join`).
6. Coerce cell values:
   - quoted cells → `string` (preserves `"404"`, `"true"`, etc.)
   - unquoted numeric strings → `number`
   - unquoted `true` / `false` → `boolean`
   - otherwise → string
7. Stop at the first empty line (row length ≤ 0).

Empty cells do not set a property on the object for that header.

## JSON → CSV (`fromJSON`)

1. Reject missing/empty arrays.
2. Walk each object depth-first using own keys only (`Object.keys`). Leaf values contribute a dotted header path (`name.first`) and a per-row value map.
3. Skip dangerous keys (`__proto__`, `prototype`, `constructor`); reject circular references and nesting deeper than 100 levels.
4. Collect the union of headers across all objects (order follows first appearance).
5. Emit a header line with each header quoted (internal `"` doubled), joined by the delimiter. Records are separated with RFC 4180 `CRLF` (`\r\n`) line endings.
6. Emit data rows: missing keys become empty fields; strings are quoted and internal `"` doubled; strings starting with `=`, `+`, `-`, or `@` are prefixed with `'` to reduce spreadsheet formula injection; numbers/booleans are written without extra quotes. `null` becomes an empty cell.

Nested plain objects are flattened. Arrays are walked as objects (index keys become path segments). Prefer plain JSON objects and scalars for predictable output.

## Design notes

- The library is intentionally small: no runtime dependencies, synchronous string APIs.
- Default-comma input and output follow RFC 4180 record separators, quoting, escaped quotes, commas, and multiline quoted fields. Trimming is the default JSON-mapping policy, although RFC 4180 treats spaces as field data; callers can opt into their preservation. The optional custom delimiter and automatic value coercion are library extensions.
- The parser requires a header row to map columns to object properties, while RFC 4180 also permits headerless files.
- Tests under `test/` encode expected behavior for nesting, delimiters, coercion, and missing fields; treat them as the behavior contract when docs and code disagree.
