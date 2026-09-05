# Development

## Requirements

- Node.js (compatible with the project's TypeScript/CommonJS setup)
- npm

## Setup

```bash
git clone https://github.com/blizarazu/csv-tools.git
cd csv-tools
npm install
```

## Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| Test | `npm test` | Run Mocha tests with nyc coverage (`nyc mocha`) |
| Build | `npm run build` | Compile `lib/` → `dist/` via `tsc` |
| Precommit | `npm run precommit` | Test, build, and `git add dist` |
| Preversion | `npm run preversion` | Same as precommit before version bumps |

Config files of note:

- `tsconfig.json` — strict TypeScript, ES5 + CommonJS, `lib/**/*` only
- `.mocharc.yml` — Mocha configuration
- `.nycrc.yml` — coverage configuration

## Working on the library

1. Change TypeScript under `lib/`.
2. Add or update tests in `test/csv-tools.ts`; use fixtures in `test/data/` when helpful.
3. Run `npm test`.
4. Run `npm run build` so `dist/` matches source (required for consumers using the published entry points).
5. If behavior or public API changed, update `docs/` and the root README as appropriate.

## Examples

The `examples/` directory contains sample scripts and a sample CSV. They illustrate typical usage; they are not a substitute for the unit tests.

## Contribution notes

- Keep the public API small and synchronous unless there is a strong reason to expand it.
- Prefer fixing or extending existing tests over adding unrelated scaffolding.
- Do not hand-edit files under `dist/`.
- Project and agent documentation should remain in English (`docs/`, `AGENTS.md`).
