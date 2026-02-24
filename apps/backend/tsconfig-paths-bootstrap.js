/**
 * tsconfig-paths Bootstrap for Production Runtime
 *
 * This file is loaded via `node -r ./tsconfig-paths-bootstrap.js dist/main.js`
 * (see ecosystem.config.js).
 *
 * Purpose: Register TypeScript path aliases (@modules/*, @shared/*, etc.)
 * so they resolve to compiled files in ./dist/ instead of source in ./src/.
 *
 * Without this, require("@modules/auth/guards/jwt-auth.guard") would try to
 * resolve to ./src/modules/... (TypeScript sources) which don't exist at runtime.
 * With this, it resolves to ./dist/modules/... (compiled JavaScript).
 *
 * @see tsconfig.json — paths definitions
 * @see tsconfig.paths.json — paths-only config (used by this bootstrap)
 */

const { register } = require('tsconfig-paths');
const path = require('path');

// Read paths from tsconfig.paths.json (or tsconfig.json)
let paths;
try {
  const pathsConfig = require('./tsconfig.paths.json');
  paths = pathsConfig.compilerOptions.paths;
} catch {
  const tsconfig = require('./tsconfig.json');
  paths = tsconfig.compilerOptions.paths;
}

// Register with baseUrl pointing to dist/ (compiled output)
// instead of src/ (TypeScript source)
register({
  baseUrl: path.resolve(__dirname, 'dist'),
  paths: paths || {},
});
