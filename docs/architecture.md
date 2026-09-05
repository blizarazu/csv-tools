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
3. Tokenize the header row and each data row with a delimiter-aware regex that understands quoted fields and escaped quotes (`""`).
4. Trim tokens; collapse `""` to `"`.
5. For each data row, build an object by walking header names. Headers containing `.` create nested objects via recursive assignment.
6. Coerce cell values:
   - numeric strings → `number`
   - `true` / `false` (exact, unquoted after processing) → `boolean`
   - otherwise → string with surrounding quotes removed when present
7. Stop at the first empty line (row length ≤ 0).

Empty cells do not set a property on the object for that header.

## JSON → CSV (`fromJSON`)

1. Reject missing/empty arrays.
2. Walk each object depth-first. Leaf values contribute a dotted header path (`name.first`) and a per-row value map.
3. Collect the union of headers across all objects (order follows first appearance).
4. Emit a header line with each header quoted, joined by the delimiter.
5. Emit data rows: missing keys become empty fields; strings are quoted and internal `"` doubled; numbers/booleans are written without extra quotes.

Nested plain objects are flattened. Non-object leaves (including arrays treated as objects in the recursion path) follow the same `typeof !== "object"` leaf rule used in source—prefer plain JSON objects and scalars for predictable output.

## Design notes

- The library is intentionally small: no runtime dependencies, synchronous string APIs.
- Quoting and delimiter handling aim to support common CSV cases (quoted commas, escaped quotes), not a full RFC 4180 edge-case suite.
- Tests under `test/` encode expected behavior for nesting, delimiters, coercion, and missing fields; treat them as the behavior contract when docs and code disagree.
