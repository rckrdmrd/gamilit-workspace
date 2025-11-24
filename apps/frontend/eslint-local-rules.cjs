/**
 * ESLint Local Rules Loader
 *
 * Loads custom ESLint rules from the eslint-rules/ directory
 */

const noApiRouteIssues = require('./eslint-rules/no-api-route-issues.cjs');

module.exports = {
  'no-api-route-issues': noApiRouteIssues,
};
