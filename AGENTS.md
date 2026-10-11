# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project

**csv-tools** is a small Node.js library that converts CSV strings to JSON arrays and JSON arrays back to CSV. Nested object paths use dotted headers (e.g. `owner.name.first`). Source is TypeScript under `lib/`; published output is compiled JavaScript and type declarations under `dist/`.

- Package: `csv-tools` (MIT)
- Entry: `dist/index.js` / `dist/index.d.ts`
- Source: `lib/`
- Tests: Mocha + Chai + nyc (`test/`)
- Examples: `examples/`

## Quick commands

```bash
npm install
npm test          # mocha via nyc
npm run build     # tsc → dist/
```

`precommit` / `preversion` run tests, build, and stage `dist/`. Prefer the same flow before finishing a change that affects the public API.

CI: GitHub Actions (`.github/workflows/ci.yml`) on `master` PRs/pushes. npm publish: tag `v*` → `.github/workflows/publish.yml` (Trusted Publishing). See [docs/development.md](docs/development.md).

## Repository layout

| Path | Role |
|------|------|
| `lib/` | TypeScript source (`index.ts`, `toJSON.ts`, `fromJSON.ts`) |
| `dist/` | Build artifacts — do not hand-edit; regenerate with `npm run build` |
| `test/` | Unit tests and fixture CSV files |
| `examples/` | Usage samples |
| `docs/` | Project documentation (English) |
| `README.md` | Public user-facing overview and API examples |

## Documentation map

Read these when you need context beyond this file:

1. [docs/README.md](docs/README.md) — documentation index
2. [docs/overview.md](docs/overview.md) — purpose and features
3. [docs/architecture.md](docs/architecture.md) — module design and conversion rules
4. [docs/api.md](docs/api.md) — API reference aligned with current source
5. [docs/development.md](docs/development.md) — setup, build, test, contribution notes

## Coding conventions

- Implement features and fixes in `lib/`, not in `dist/`.
- Keep public exports in `lib/index.ts` as the single package surface.
- Match existing TypeScript style: explicit types where useful, small focused helpers, CommonJS output via `tsconfig.json`.
- Prefer extending existing tests in `test/csv-tools.ts` (and fixtures under `test/data/`) over one-off scripts.
- After behavior changes, run `npm test` and `npm run build`.
- Do not invent APIs that are not in source. Prefer `docs/api.md` and `lib/` over outdated README sections when they disagree.

## Known documentation gap

The root `README.md` still documents `fileToJSON(csvFilePath[, delimiter], callback)`. That helper is **not** exported from the current TypeScript sources (`lib/index.ts` only exports `toJSON` and `fromJSON`). Treat `fileToJSON` as legacy/outdated docs unless/until it is reimplemented.

## Agent workflow

1. Confirm intent and scope before large changes.
2. Prefer small, focused diffs that match surrounding code.
3. Update tests when behavior changes; update `docs/` (and README if user-facing) when the public API or conversion rules change.
4. Write agent-facing and project docs in **English**.
5. Do not commit or push unless the user explicitly asks.
