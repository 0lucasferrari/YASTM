# Security

## Dependency Audit

### Production dependencies

- **API (root):** Run `npm run audit:ci` to audit only production dependencies.
- **Client:** Run `cd client && npm run audit:ci` for the frontend.

Both pass CI because all known vulnerabilities are in **devDependencies** (ESLint, TypeScript-ESLint, Jest).

### Dev dependencies – ajv (CVE-2025-69873)

`npm audit` reports 7 moderate vulnerabilities in the ESLint/TypeScript-ESLint chain due to **ajv** (CVE-2025-69873, ReDoS when using `$data` option).

**Status:** No fix available from upstream.

- ESLint uses ajv v6 for config validation and does **not** use the `$data` option, so this CVE does not apply to ESLint’s usage ([eslint/eslint#20508](https://github.com/eslint/eslint/issues/20508)).
- ESLint has declined upgrading to ajv v8 due to breaking changes.
- An ajv v6 backport is in progress: [ajv-validator/ajv#2590](https://github.com/ajv-validator/ajv/pull/2590).

**Recommendation:** For strict security policies, run `npm run audit:ci` in CI (audits only production deps). For full audits, treat these as accepted risk or wait for the ajv v6 backport.

### Client – xlsx replaced with exceljs

The client previously used `xlsx` (SheetJS), which had high-severity vulnerabilities (Prototype Pollution, ReDoS). It has been replaced with **exceljs**, which has no known vulnerabilities and provides equivalent Excel export functionality.
