/**
 * Environment configuration for GAMILIT Platform
 *
 * IMPORTANT: All required environment variables must be defined in .env files
 * - Development: .env or .env.development
 * - Production: .env.production
 *
 * This configuration uses granular variables to build URLs instead of legacy monolithic URLs
 */

/**
 * Get optional environment variable with default value
 */
function getOptionalEnv(key: string, defaultValue: string): string {
  const value = import.meta.env[key];
  return value && value !== 'undefined' ? value : defaultValue;
}

/**
 * Parse boolean environment variable
 */
function parseBooleanEnv(key: string, defaultValue: boolean): boolean {
  const value = import.meta.env[key];
  if (!value || value === 'undefined') {
    return defaultValue;
  }
  return value === 'true' || value === '1';
}

/**
 * Parse number environment variable
 */
function parseNumberEnv(key: string, defaultValue: number): number {
  const value = import.meta.env[key];
  if (!value || value === 'undefined') {
    return defaultValue;
  }
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Build API URL from granular variables
const apiProtocol = getOptionalEnv('VITE_API_PROTOCOL', 'http');
const apiHost = getOptionalEnv('VITE_API_HOST', 'localhost:3006');
const apiVersion = getOptionalEnv('VITE_API_VERSION', 'v1');

const wsProtocol = getOptionalEnv('VITE_WS_PROTOCOL', 'ws');
const wsHost = getOptionalEnv('VITE_WS_HOST', apiHost);

// Environment configuration
export const env = {
  // Mode
  isDevelopment: import.meta.env.MODE === 'development',
  isProduction: import.meta.env.MODE === 'production',
  mode: import.meta.env.MODE,

  // API Configuration (built from granular variables)
  apiUrl: `${apiProtocol}://${apiHost}/api/${apiVersion}`,
  wsUrl: `${wsProtocol}://${wsHost}`,

  // Granular config (for components that need it)
  api: {
    protocol: apiProtocol,
    host: apiHost,
    version: apiVersion,
    get baseUrl() {
      return `${apiProtocol}://${apiHost}/api/${apiVersion}`;
    },
  },
  ws: {
    protocol: wsProtocol,
    host: wsHost,
    get url() {
      return `${wsProtocol}://${wsHost}`;
    },
  },

  // App Configuration (OPTIONAL with defaults)
  appName: getOptionalEnv('VITE_APP_NAME', 'GAMILIT Platform'),
  apiTimeout: parseNumberEnv('VITE_API_TIMEOUT', 30000),

  // Feature Flags (OPTIONAL with defaults)
  enableGamification: parseBooleanEnv('VITE_ENABLE_GAMIFICATION', true),
  enableSocialFeatures: parseBooleanEnv('VITE_ENABLE_SOCIAL_FEATURES', true),

  // Debug/Development (OPTIONAL with defaults)
  debugApi: parseBooleanEnv('VITE_DEBUG_API', false),
  mockApi: parseBooleanEnv('VITE_MOCK_API', false),
} as const;

// Validation: Log configuration in development
if (env.isDevelopment) {
  console.log('[ENV] Configuration loaded:', {
    mode: env.mode,
    apiUrl: env.apiUrl,
    wsUrl: env.wsUrl,
    appName: env.appName,
    enableGamification: env.enableGamification,
    enableSocialFeatures: env.enableSocialFeatures,
  });
}

// Validation: Warn if using localhost in production
if (env.isProduction && env.api.host.includes('localhost')) {
  console.error(
    '[ENV] ERROR: Production build is using localhost API URL!\n' +
      'This will cause the application to fail in production.\n' +
      'Please set VITE_API_HOST to the production server domain in .env.production',
  );
  throw new Error('Invalid production configuration: VITE_API_HOST points to localhost');
}

// Validation: Ensure protocols are valid
if (!['http', 'https'].includes(env.api.protocol)) {
  throw new Error('VITE_API_PROTOCOL must be either "http" or "https"');
}

if (!['ws', 'wss'].includes(env.ws.protocol)) {
  throw new Error('VITE_WS_PROTOCOL must be either "ws" or "wss"');
}

// Export for reference
export default env;
