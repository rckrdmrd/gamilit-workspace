/**
 * Custom ESLint Rule: no-api-route-issues
 *
 * Prevents common API route configuration errors:
 * 1. Duplicate /api/ prefix in route paths
 * 2. New axios instances (must use official apiClient)
 * 3. Direct fetch() calls (must use apiClient)
 * 4. Hardcoded API URLs (must use constants)
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent API route configuration issues',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
    messages: {
      duplicateApiPrefix:
        'Duplicate /api/ prefix detected. The baseURL already includes /api, remove it from the endpoint path.\n' +
        'Example: Change `apiClient.get("/api/v1/users")` to `apiClient.get("/v1/users")`',
      newAxiosInstance:
        'Creating new axios instance is forbidden. Use the official apiClient from @/services/api/apiClient instead.\n' +
        'Import: import { apiClient } from "@/services/api/apiClient"',
      directFetch:
        'Direct fetch() calls bypass authentication and error handling. Use apiClient instead.\n' +
        'Example: Change `fetch("/api/users")` to `apiClient.get("/api/users")`',
      hardcodedUrl:
        'Hardcoded API URL detected. Use API_ENDPOINTS constants instead.\n' +
        'Import: import { API_ENDPOINTS } from "@/shared/constants/api-endpoints"',
    },
  },

  create(context) {
    const OFFICIAL_API_CLIENT = '@/services/api/apiClient';
    const API_PATTERN = /\/api\//;
    const DOUBLE_API_PATTERN = /\/api\/api\//;
    const HTTP_URL_PATTERN = /https?:\/\//;

    return {
      // Rule 1: Detect duplicate /api/api/ prefix
      CallExpression(node) {
        // Check apiClient.get/post/put/patch/delete calls
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'apiClient' &&
          ['get', 'post', 'put', 'patch', 'delete'].includes(node.callee.property.name)
        ) {
          const firstArg = node.arguments[0];

          if (firstArg && firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
            // Check for duplicate /api/api/
            if (DOUBLE_API_PATTERN.test(firstArg.value)) {
              context.report({
                node: firstArg,
                messageId: 'duplicateApiPrefix',
                fix(fixer) {
                  // Auto-fix: Remove the first /api/
                  const fixed = firstArg.value.replace(/\/api\/api\//, '/api/');
                  return fixer.replaceText(firstArg, `'${fixed}'`);
                },
              });
            }

            // Check for /api/v1/ pattern (should be /v1/ since baseURL already has /api)
            if (firstArg.value.startsWith('/api/v1')) {
              context.report({
                node: firstArg,
                messageId: 'duplicateApiPrefix',
                fix(fixer) {
                  // Auto-fix: Remove /api/ prefix
                  const fixed = firstArg.value.replace(/^\/api\//, '/');
                  return fixer.replaceText(firstArg, `'${fixed}'`);
                },
              });
            }

            // Check for hardcoded HTTP URLs
            if (HTTP_URL_PATTERN.test(firstArg.value)) {
              context.report({
                node: firstArg,
                messageId: 'hardcodedUrl',
              });
            }
          }
        }

        // Rule 3: Detect direct fetch() calls
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'fetch'
        ) {
          const firstArg = node.arguments[0];

          // Only report if it's an API call (contains /api/ or HTTP URL)
          if (firstArg && firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
            if (API_PATTERN.test(firstArg.value) || HTTP_URL_PATTERN.test(firstArg.value)) {
              context.report({
                node,
                messageId: 'directFetch',
              });
            }
          }

          // Also check template literals
          if (firstArg && firstArg.type === 'TemplateLiteral') {
            const templateString = firstArg.quasis.map(q => q.value.cooked).join('');
            if (API_PATTERN.test(templateString) || HTTP_URL_PATTERN.test(templateString)) {
              context.report({
                node,
                messageId: 'directFetch',
              });
            }
          }
        }
      },

      // Rule 2: Detect new axios instances
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'axios' &&
          node.callee.property.name === 'create'
        ) {
          // Allow in the official apiClient file
          const filename = context.getFilename();
          if (filename.includes('services/api/apiClient')) {
            return;
          }

          context.report({
            node,
            messageId: 'newAxiosInstance',
          });
        }
      },

      // Additional check: Detect imports of deleted files
      ImportDeclaration(node) {
        const source = node.source.value;

        // Check for deleted files
        const deletedFiles = [
          '@/lib/api/client',
          '@/shared/utils/api.util',
          '@/features/auth/api/apiClient',
          './apiClient', // Relative import in features/auth/api
          './api.util', // Relative import in shared/utils
        ];

        if (deletedFiles.some(deleted => source.includes(deleted))) {
          context.report({
            node,
            message: `This file has been deleted. Use '${OFFICIAL_API_CLIENT}' instead.`,
            fix(fixer) {
              return fixer.replaceText(node.source, `'${OFFICIAL_API_CLIENT}'`);
            },
          });
        }
      },
    };
  },
};
