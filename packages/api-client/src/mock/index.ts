/**
 * Mock layer for local development without a backend.
 *
 * `buildHandlers(seed)` returns MSW v2 RequestHandler[] for any setup
 * (browser worker, Node test server, etc.). The consumer app supplies the
 * seed JSON because the package itself stays free of seed imports.
 */

export { buildHandlers, type MockSeed, type PillarTblSummary } from './handlers';
