import { registerAs } from '@nestjs/config';

export default registerAs(
  'jwt',
  () => ({
    secret: process.env.JWT_SECRET || 'dev-only-jwt-secret-not-for-production',
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: process.env.JWT_ISSUER || 'gamilit-api',
      audience: process.env.JWT_AUDIENCE || 'gamilit-app',
    },
    verifyOptions: {
      issuer: process.env.JWT_ISSUER || 'gamilit-api',
      audience: process.env.JWT_AUDIENCE || 'gamilit-app',
    },
  }),
);

// Refresh token configuration
export const refreshTokenConfig = registerAs('refreshToken', () => ({
  secret: process.env.JWT_REFRESH_SECRET || 'dev-only-refresh-secret-not-for-production',
  expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));