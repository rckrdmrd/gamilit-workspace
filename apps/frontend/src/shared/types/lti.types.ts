/**
 * LTI Types for EXT-007 LTI Consumer Management
 *
 * TypeScript types for LTI 1.3 consumer configuration
 * used throughout the frontend application.
 *
 * @module shared/types/lti.types
 * @see ET-LTI-001-integration.md
 */

/**
 * LtiConsumer - Complete LTI consumer configuration
 *
 * Represents an LMS (Learning Management System) that integrates
 * with GAMILIT via LTI 1.3 protocol.
 */
export interface LtiConsumer {
  /** Consumer UUID */
  id: string;

  /** Issuer identifier (e.g., https://canvas.instructure.com) */
  platformId: string;

  /** OAuth2 client_id assigned by the LMS */
  clientId: string;

  /** LTI deployment ID for multi-deployment scenarios */
  deploymentId: string | null;

  /** JWKS URL for validating tokens */
  publicKeysetUrl: string;

  /** OAuth2 token endpoint */
  accessTokenUrl: string;

  /** OIDC authorization endpoint */
  authorizationUrl: string;

  /** Human-readable LMS name (e.g., "Canvas UAM Xochimilco") */
  platformName: string;

  /** LMS version */
  platformVersion: string | null;

  /** Contact email for LMS admin */
  platformContactEmail: string | null;

  /** Tenant ID for multi-tenancy */
  tenantId: string | null;

  /** Supports LTI Deep Linking */
  supportsDeepLinking: boolean;

  /** Supports Names and Role Provisioning Services */
  supportsNrps: boolean;

  /** Supports Assignment and Grade Services */
  supportsAgs: boolean;

  /** Legacy LTI 1.1 consumer key (optional) */
  consumerKey: string | null;

  /** Legacy LTI 1.1 consumer secret (optional) */
  consumerSecret: string | null;

  /** Custom parameters for the consumer */
  customParameters: Record<string, unknown>;

  /** Whether the consumer is active */
  isActive: boolean;

  /** Whether the consumer has been verified */
  isVerified: boolean;

  /** ID of user who created this consumer */
  createdBy: string | null;

  /** Creation timestamp */
  createdAt: string;

  /** Last update timestamp */
  updatedAt: string;

  /** Last time the consumer was used */
  lastUsedAt: string | null;
}

/**
 * CreateLtiConsumerDto - Data for creating a new LTI consumer
 */
export interface CreateLtiConsumerDto {
  /** Issuer identifier (URL) */
  platformId: string;

  /** OAuth2 client_id */
  clientId: string;

  /** LTI deployment ID */
  deploymentId?: string;

  /** JWKS URL */
  publicKeysetUrl: string;

  /** Token endpoint */
  accessTokenUrl: string;

  /** Authorization endpoint */
  authorizationUrl: string;

  /** Human-readable name */
  platformName: string;

  /** LMS version */
  platformVersion?: string;

  /** Contact email */
  platformContactEmail?: string;

  /** Tenant ID */
  tenantId?: string;

  /** Supports Deep Linking */
  supportsDeepLinking?: boolean;

  /** Supports NRPS */
  supportsNrps?: boolean;

  /** Supports AGS */
  supportsAgs?: boolean;

  /** Custom parameters */
  customParameters?: Record<string, unknown>;
}

/**
 * UpdateLtiConsumerDto - Data for updating an existing LTI consumer
 */
export interface UpdateLtiConsumerDto extends Partial<CreateLtiConsumerDto> {
  /** Active status */
  isActive?: boolean;

  /** Verified status */
  isVerified?: boolean;
}

/**
 * LtiConsumerStats - Statistics for LTI consumers
 */
export interface LtiConsumerStats {
  /** Total number of consumers */
  total: number;

  /** Number of active consumers */
  active: number;

  /** Number of verified consumers */
  verified: number;
}

/**
 * ConnectionTestResult - Result of testing LTI connection
 */
export interface ConnectionTestResult {
  /** Whether the connection test succeeded */
  success: boolean;

  /** Status message */
  message: string;

  /** Response time in milliseconds */
  responseTimeMs?: number;

  /** Details of any errors */
  error?: string;

  /** Timestamp of the test */
  testedAt: string;
}

/**
 * LtiCredentials - Regenerated credentials for a consumer
 */
export interface LtiCredentials {
  /** Consumer key (for LTI 1.1 legacy) */
  consumerKey: string;

  /** Consumer secret (for LTI 1.1 legacy) */
  consumerSecret: string;

  /** Timestamp when credentials were generated */
  generatedAt: string;
}

/**
 * LtiLaunchUrl - URLs needed for LTI tool configuration
 */
export interface LtiLaunchUrl {
  /** OIDC login initiation URL */
  oidcLoginUrl: string;

  /** LTI launch URL */
  launchUrl: string;

  /** JWKS URL for tool's public keys */
  jwksUrl: string;

  /** Deep Linking response URL */
  deepLinkUrl: string;
}

/**
 * LtiSession - Active LTI session information
 */
export interface LtiSession {
  /** Session ID */
  id: string;

  /** Consumer ID */
  consumerId: string;

  /** User ID (in GAMILIT) */
  userId: string | null;

  /** LTI user ID (from LMS) */
  ltiUserId: string;

  /** Launch context ID */
  contextId: string | null;

  /** Resource link ID */
  resourceLinkId: string | null;

  /** Session creation time */
  createdAt: string;

  /** Session expiration time */
  expiresAt: string;
}
