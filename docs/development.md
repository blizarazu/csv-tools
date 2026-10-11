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

## Continuous integration

GitHub Actions runs on pushes and pull requests to `master`:

- Workflow: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
- Steps: `npm ci` → `npm test` → `npm run build`
- Node versions: 22 and 24

## Releasing to npm

Publishing is automated on version tags via Trusted Publishing (OIDC). No long-lived npm token is stored in the repository.

1. Ensure the working tree is clean and `master` is up to date.
2. Bump the version (runs `preversion` → test, build, stage `dist/`):

   ```bash
   npm version patch   # or minor / major
   ```

3. Push the commit and tag:

   ```bash
   git push && git push --tags
   ```

4. The [`.github/workflows/publish.yml`](../.github/workflows/publish.yml) workflow:
   - triggers on tags matching `v*`
   - checks that the tag (without `v`) matches `package.json` version
   - runs test and build
   - runs `npm publish --access public` with provenance via OIDC

### One-time Trusted Publisher setup

On [npmjs.com](https://www.npmjs.com/) → package **csv-tools** → **Settings** → **Trusted Publisher**:

| Field | Value |
|-------|-------|
| Provider | GitHub Actions |
| Organization/user | `blizarazu` |
| Repository | `csv-tools` |
| Workflow filename | `publish.yml` |
| Environment | _(leave empty)_ |

Allow `npm publish` for that trusted publisher.

## Contribution notes

- Keep the public API small and synchronous unless there is a strong reason to expand it.
- Prefer fixing or extending existing tests over adding unrelated scaffolding.
- Do not hand-edit files under `dist/`.
- Project and agent documentation should remain in English (`docs/`, `AGENTS.md`).
