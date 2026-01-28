import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { LtiConsumer, LtiSession } from '../entities';
import { LtiConsumersService } from './lti-consumers.service';
import { LtiSessionsService } from './lti-sessions.service';
import {
  OidcInitiateDto,
  OidcLoginResponseDto,
  OidcCallbackDto,
  LtiClaimsDto,
  LtiLaunchDataDto,
} from '../dto';

/**
 * OIDC State Storage Interface
 * In production, this should be stored in Redis
 */
interface OidcStateData {
  nonce: string;
  consumerId: string;
  targetLinkUri: string;
  loginHint: string;
  ltiMessageHint?: string;
  createdAt: Date;
}

/**
 * OidcLoginService
 *
 * @description Handles LTI 1.3 OIDC authentication flow.
 * Implements the IMS Security Framework for LTI.
 *
 * @see https://www.imsglobal.org/spec/security/v1p0/
 *
 * Flow:
 * 1. Platform initiates login (initiateLogin)
 * 2. Tool redirects to platform authorization endpoint
 * 3. Platform authenticates user and calls back (handleCallback)
 * 4. Tool validates ID token and creates session
 */
@Injectable()
export class OidcLoginService {
  private readonly logger = new Logger(OidcLoginService.name);

  // In-memory state storage (should be Redis in production)
  private readonly stateStore = new Map<string, OidcStateData>();

  // State TTL in milliseconds (10 minutes)
  private readonly STATE_TTL = 10 * 60 * 1000;

  constructor(
    @InjectRepository(LtiConsumer, 'lti')
    private readonly consumerRepo: Repository<LtiConsumer>,
    @InjectRepository(LtiSession, 'lti')
    private readonly sessionRepo: Repository<LtiSession>,
    private readonly consumersService: LtiConsumersService,
    private readonly sessionsService: LtiSessionsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    // Cleanup expired states periodically
    setInterval(() => this.cleanupExpiredStates(), 60000);
  }

  /**
   * Step 1: Initiate OIDC Login
   *
   * Called when LMS initiates the LTI launch.
   * Returns the authorization URL to redirect the user.
   *
   * @param dto - OIDC initiation parameters from LMS
   * @returns Authorization URL and state/nonce for verification
   */
  async initiateLogin(dto: OidcInitiateDto): Promise<OidcLoginResponseDto> {
    this.logger.log(`OIDC Login initiated from ${dto.iss}`);

    // Find the consumer by platform ID and optional client ID
    const consumer = await this.findConsumer(dto.iss, dto.client_id);
    if (!consumer) {
      throw new BadRequestException(
        `Unknown platform: ${dto.iss}. Consumer not registered.`,
      );
    }

    if (!consumer.isActive) {
      throw new BadRequestException(
        `Consumer ${consumer.platformName} is not active`,
      );
    }

    // Generate state and nonce
    const state = uuidv4();
    const nonce = uuidv4();

    // Store state for validation in callback
    this.stateStore.set(state, {
      nonce,
      consumerId: consumer.id,
      targetLinkUri: dto.target_link_uri,
      loginHint: dto.login_hint,
      ltiMessageHint: dto.lti_message_hint,
      createdAt: new Date(),
    });

    // Build authorization URL
    const authorizationUrl = this.buildAuthorizationUrl(consumer, dto, state, nonce);

    this.logger.log(`Generated authorization URL for consumer ${consumer.id}`);

    return {
      authorizationUrl,
      state,
      nonce,
    };
  }

  /**
   * Step 2: Handle OIDC Callback
   *
   * Called when the LMS redirects back with the ID token.
   * Validates the token and creates an LTI session.
   *
   * @param dto - Callback parameters including ID token
   * @returns Launch data with session info and access token
   */
  async handleCallback(dto: OidcCallbackDto): Promise<LtiLaunchDataDto> {
    this.logger.log('Processing OIDC callback');

    // Check for errors
    if (dto.error) {
      this.logger.warn(`OIDC error: ${dto.error} - ${dto.error_description}`);
      throw new UnauthorizedException(
        dto.error_description || `Authentication failed: ${dto.error}`,
      );
    }

    // Validate state
    const stateData = this.stateStore.get(dto.state);
    if (!stateData) {
      throw new UnauthorizedException('Invalid or expired state parameter');
    }

    // Remove state after use (single use)
    this.stateStore.delete(dto.state);

    // Get consumer
    const consumer = await this.consumerRepo.findOne({
      where: { id: stateData.consumerId },
    });
    if (!consumer) {
      throw new UnauthorizedException('Consumer not found');
    }

    // Validate and decode ID token
    const claims = await this.validateIdToken(dto.id_token, consumer, stateData.nonce);

    // Create LTI session
    const session = await this.createSession(claims, consumer.id);

    // Update consumer last used timestamp
    await this.consumersService.updateLastUsed(consumer.id);

    // Generate access token for Gamilit
    const accessToken = await this.generateAccessToken(session, claims);

    // Build launch data
    const launchData = this.buildLaunchData(session, claims, accessToken);

    this.logger.log(`LTI session created: ${session.id}`);

    return launchData;
  }

  /**
   * Validate ID token JWT
   *
   * @param token - The ID token JWT from the LMS
   * @param consumer - The LTI consumer configuration
   * @param expectedNonce - The nonce to validate against
   * @returns Parsed and validated claims
   */
  async validateIdToken(
    token: string,
    consumer: LtiConsumer,
    expectedNonce: string,
  ): Promise<LtiClaimsDto> {
    try {
      // Decode the token header to get the key ID
      const decodedHeader = jwt.decode(token, { complete: true });
      if (!decodedHeader) {
        throw new UnauthorizedException('Invalid ID token format');
      }

      // Fetch JWKS from platform (simplified - in production, cache this)
      const publicKey = await this.fetchPublicKey(
        consumer.publicKeysetUrl,
        decodedHeader.header.kid,
      );

      // Verify the token
      const claims = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
        issuer: consumer.platformId,
        audience: consumer.clientId,
      }) as LtiClaimsDto;

      // Validate nonce
      if (claims.nonce !== expectedNonce) {
        throw new UnauthorizedException('Nonce mismatch');
      }

      // Validate required LTI claims
      this.validateLtiClaims(claims);

      return claims;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('ID token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(`Invalid ID token: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Create LTI session from validated claims
   *
   * @param claims - Validated LTI claims
   * @param consumerId - Consumer ID
   * @returns Created LTI session
   */
  async createSession(claims: LtiClaimsDto, consumerId: string): Promise<LtiSession> {
    const messageType = claims['https://purl.imsglobal.org/spec/lti/claim/message_type'];
    const resourceLink = claims['https://purl.imsglobal.org/spec/lti/claim/resource_link'];
    const context = claims['https://purl.imsglobal.org/spec/lti/claim/context'];
    const launchPresentation = claims['https://purl.imsglobal.org/spec/lti/claim/launch_presentation'];
    const roles = claims['https://purl.imsglobal.org/spec/lti/claim/roles'] || [];

    const session = await this.sessionsService.create({
      consumerId,
      launchId: uuidv4(),
      messageType,
      contextId: context?.id,
      contextLabel: context?.label,
      contextTitle: context?.title,
      resourceLinkId: resourceLink?.id,
      resourceLinkTitle: resourceLink?.title,
      lmsUserId: claims.sub,
      lmsUserEmail: claims.email,
      lmsUserName: claims.name || `${claims.given_name || ''} ${claims.family_name || ''}`.trim(),
      lmsUserRoles: roles,
      idTokenClaims: claims as unknown as Record<string, unknown>,
      returnUrl: launchPresentation?.return_url,
    });

    return session;
  }

  /**
   * Build authorization URL for OIDC redirect
   */
  private buildAuthorizationUrl(
    consumer: LtiConsumer,
    dto: OidcInitiateDto,
    state: string,
    nonce: string,
  ): string {
    const toolUrl = this.configService.get<string>('APP_URL') || 'https://gamilit.com';
    const redirectUri = `${toolUrl}/api/v1/lti/oidc/callback`;

    const params = new URLSearchParams({
      scope: 'openid',
      response_type: 'id_token',
      response_mode: 'form_post',
      client_id: consumer.clientId,
      redirect_uri: redirectUri,
      state,
      nonce,
      login_hint: dto.login_hint,
      prompt: 'none',
    });

    if (dto.lti_message_hint) {
      params.append('lti_message_hint', dto.lti_message_hint);
    }

    return `${consumer.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Fetch public key from JWKS endpoint
   */
  private async fetchPublicKey(jwksUrl: string, kid?: string): Promise<string> {
    try {
      const response = await fetch(jwksUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch JWKS: ${response.status}`);
      }

      const jwks = await response.json() as { keys?: Record<string, unknown>[] };
      const keys = jwks.keys || [];

      // Find key by kid or use first key
      let key = keys[0];
      if (kid) {
        const foundKey = keys.find((k) => k.kid === kid);
        if (foundKey) {
          key = foundKey;
        }
      }

      if (!key) {
        throw new Error('No suitable key found in JWKS');
      }

      // Convert JWK to PEM (simplified - in production use a proper library)
      return this.jwkToPem(key);
    } catch (error) {
      this.logger.error(`Failed to fetch public key: ${error}`);
      throw new UnauthorizedException('Failed to validate ID token: key fetch failed');
    }
  }

  /**
   * Convert JWK to PEM format (simplified implementation)
   * In production, use a library like 'jwk-to-pem'
   */
  private jwkToPem(jwk: Record<string, unknown>): string {
    // This is a simplified implementation
    // For production, use the 'jwk-to-pem' package or crypto.createPublicKey
    const key = crypto.createPublicKey({ key: jwk, format: 'jwk' });
    return key.export({ type: 'spki', format: 'pem' }) as string;
  }

  /**
   * Validate required LTI claims
   */
  private validateLtiClaims(claims: LtiClaimsDto): void {
    const messageType = claims['https://purl.imsglobal.org/spec/lti/claim/message_type'];
    const version = claims['https://purl.imsglobal.org/spec/lti/claim/version'];
    const deploymentId = claims['https://purl.imsglobal.org/spec/lti/claim/deployment_id'];

    if (!messageType) {
      throw new UnauthorizedException('Missing LTI message_type claim');
    }

    if (version !== '1.3.0') {
      throw new UnauthorizedException(`Unsupported LTI version: ${version}`);
    }

    if (!deploymentId) {
      throw new UnauthorizedException('Missing LTI deployment_id claim');
    }

    // Validate message type
    const validMessageTypes = [
      'LtiResourceLinkRequest',
      'LtiDeepLinkingRequest',
    ];
    if (!validMessageTypes.includes(messageType)) {
      throw new UnauthorizedException(`Unsupported message type: ${messageType}`);
    }
  }

  /**
   * Find consumer by platform ID and optional client ID
   */
  private async findConsumer(
    platformId: string,
    clientId?: string,
  ): Promise<LtiConsumer | null> {
    if (clientId) {
      return this.consumersService.findByPlatformAndClient(platformId, clientId);
    }

    // If no client ID, find by platform ID only (may match multiple)
    const consumers = await this.consumerRepo.find({
      where: { platformId, isActive: true },
      take: 1,
    });

    return consumers[0] || null;
  }

  /**
   * Generate Gamilit access token for the session
   */
  private async generateAccessToken(
    session: LtiSession,
    _claims: LtiClaimsDto,
  ): Promise<string> {
    return this.jwtService.sign({
      sub: session.userId || session.lmsUserId,
      sessionId: session.id,
      launchId: session.launchId,
      consumerId: session.consumerId,
      roles: session.lmsUserRoles,
      type: 'lti_session',
    });
  }

  /**
   * Build launch data response
   */
  private buildLaunchData(
    session: LtiSession,
    claims: LtiClaimsDto,
    accessToken: string,
  ): LtiLaunchDataDto {
    const deepLinkingSettings = claims['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'];
    const messageType = claims['https://purl.imsglobal.org/spec/lti/claim/message_type'];

    const launchData: LtiLaunchDataDto = {
      sessionId: session.id,
      messageType,
      consumerId: session.consumerId,
      accessToken,
    };

    if (session.userId) {
      launchData.userId = session.userId;
    }

    if (session.contextId) {
      launchData.context = {
        id: session.contextId,
        label: session.contextLabel || undefined,
        title: session.contextTitle || undefined,
      };
    }

    if (session.resourceLinkId) {
      launchData.resourceLink = {
        id: session.resourceLinkId,
        title: session.resourceLinkTitle || undefined,
      };
    }

    if (deepLinkingSettings) {
      launchData.deepLinkingSettings = {
        returnUrl: deepLinkingSettings.deep_link_return_url,
        acceptTypes: deepLinkingSettings.accept_types,
        acceptMultiple: deepLinkingSettings.accept_multiple ?? true,
      };
    }

    // Determine redirect URL based on message type
    const toolUrl = this.configService.get<string>('APP_URL') || 'https://gamilit.com';
    if (messageType === 'LtiDeepLinkingRequest') {
      launchData.redirectUrl = `${toolUrl}/lti/content-picker?session=${session.id}`;
    } else {
      launchData.redirectUrl = `${toolUrl}/lti/launch?session=${session.id}`;
    }

    return launchData;
  }

  /**
   * Cleanup expired state entries
   */
  private cleanupExpiredStates(): void {
    const now = Date.now();
    for (const [state, data] of this.stateStore.entries()) {
      if (now - data.createdAt.getTime() > this.STATE_TTL) {
        this.stateStore.delete(state);
      }
    }
  }

  /**
   * Get JWKS for this tool (expose public key for platform to validate our JWTs)
   */
  async getJwks(): Promise<{ keys: Record<string, unknown>[] }> {
    // In production, generate and store RSA key pair
    // This is a placeholder that should be implemented with proper key management
    const publicKeyPem = this.configService.get<string>('LTI_PUBLIC_KEY');

    if (!publicKeyPem) {
      return { keys: [] };
    }

    // Convert PEM to JWK (simplified - use a library in production)
    const key = crypto.createPublicKey(publicKeyPem);
    const jwk = key.export({ format: 'jwk' }) as Record<string, unknown>;

    return {
      keys: [
        {
          ...jwk,
          kid: 'gamilit-lti-key-1',
          use: 'sig',
          alg: 'RS256',
        },
      ],
    };
  }
}
