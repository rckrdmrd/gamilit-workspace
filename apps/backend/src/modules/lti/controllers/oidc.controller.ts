import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { OidcLoginService } from '../services/oidc-login.service';
import {
  OidcInitiateDto,
  OidcLoginResponseDto,
  OidcCallbackDto,
  LtiLaunchDataDto,
} from '../dto';

/**
 * OidcController
 *
 * @description Handles LTI 1.3 OIDC authentication flow.
 *
 * Flow:
 * 1. GET /lti/oidc/login - Platform initiates login (redirect to platform auth)
 * 2. POST /lti/oidc/callback - Platform sends ID token after auth
 * 3. GET /lti/oidc/jwks - Expose our public keys for platform to verify our JWTs
 *
 * @route /lti/oidc
 * @security None (public endpoints for LTI authentication)
 */
@ApiTags('LTI OIDC')
@Controller('api/v1/lti/oidc')
export class OidcController {
  private readonly logger = new Logger(OidcController.name);

  constructor(private readonly oidcService: OidcLoginService) {}

  /**
   * Step 1: OIDC Login Initiation
   *
   * Called by the LMS to initiate LTI launch.
   * Redirects user to the platform's authorization endpoint.
   */
  @Get('login')
  @HttpCode(HttpStatus.FOUND)
  @ApiOperation({
    summary: 'Initiate OIDC login',
    description: 'Called by LMS to start LTI 1.3 OIDC authentication flow. Redirects to platform authorization.',
  })
  @ApiQuery({ name: 'iss', description: 'Issuer (Platform ID)', required: true })
  @ApiQuery({ name: 'login_hint', description: 'Login hint from platform', required: true })
  @ApiQuery({ name: 'target_link_uri', description: 'Target resource URI', required: true })
  @ApiQuery({ name: 'lti_message_hint', description: 'LTI message hint', required: false })
  @ApiQuery({ name: 'client_id', description: 'OAuth2 client ID', required: false })
  @ApiQuery({ name: 'lti_deployment_id', description: 'LTI deployment ID', required: false })
  @ApiResponse({
    status: 302,
    description: 'Redirect to platform authorization endpoint',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid parameters or unknown platform',
  })
  async initiateLogin(
    @Query() dto: OidcInitiateDto,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(`OIDC login initiated from platform: ${dto.iss}`);

    const response = await this.oidcService.initiateLogin(dto);

    // Redirect to platform authorization URL
    res.redirect(response.authorizationUrl);
  }

  /**
   * Alternative: Return JSON instead of redirect (for debugging/testing)
   */
  @Get('login/debug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Initiate OIDC login (debug mode)',
    description: 'Returns authorization URL instead of redirecting. For testing only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authorization URL and state',
    type: OidcLoginResponseDto,
  })
  async initiateLoginDebug(@Query() dto: OidcInitiateDto): Promise<OidcLoginResponseDto> {
    this.logger.log(`OIDC login initiated (debug) from platform: ${dto.iss}`);
    return this.oidcService.initiateLogin(dto);
  }

  /**
   * Step 2: OIDC Callback
   *
   * Called by the LMS after user authentication.
   * Receives the ID token via form POST.
   */
  @Post('callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle OIDC callback',
    description: 'Receives ID token from platform after authentication. Creates LTI session.',
  })
  @ApiResponse({
    status: 200,
    description: 'Launch data with session and access token',
    type: LtiLaunchDataDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired token',
  })
  async handleCallback(
    @Body() dto: OidcCallbackDto,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log('OIDC callback received');

    const launchData = await this.oidcService.handleCallback(dto);

    // Redirect to appropriate page based on message type
    if (launchData.redirectUrl) {
      // Set session cookie or pass token via URL
      res.cookie('lti_session', launchData.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none', // Required for cross-site LTI launches
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      // Append access token to redirect URL
      const redirectUrl = new URL(launchData.redirectUrl);
      redirectUrl.searchParams.set('token', launchData.accessToken);
      redirectUrl.searchParams.set('session', launchData.sessionId);

      res.redirect(redirectUrl.toString());
    } else {
      // Return JSON response if no redirect
      res.json(launchData);
    }
  }

  /**
   * Alternative: Return JSON instead of redirect (for API clients)
   */
  @Post('callback/json')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle OIDC callback (JSON response)',
    description: 'Returns launch data as JSON instead of redirecting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Launch data with session and access token',
    type: LtiLaunchDataDto,
  })
  async handleCallbackJson(@Body() dto: OidcCallbackDto): Promise<LtiLaunchDataDto> {
    this.logger.log('OIDC callback received (JSON mode)');
    return this.oidcService.handleCallback(dto);
  }

  /**
   * Step 3: JWKS Endpoint
   *
   * Exposes our public keys for the platform to validate JWTs we sign
   * (used for deep linking responses, grade passback, etc.)
   */
  @Get('jwks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get JWKS (JSON Web Key Set)',
    description: 'Returns public keys for platforms to verify JWTs signed by this tool.',
  })
  @ApiResponse({
    status: 200,
    description: 'JWKS with public keys',
    schema: {
      example: {
        keys: [
          {
            kty: 'RSA',
            kid: 'gamilit-lti-key-1',
            use: 'sig',
            alg: 'RS256',
            n: '...',
            e: 'AQAB',
          },
        ],
      },
    },
  })
  async getJwks(): Promise<{ keys: Record<string, unknown>[] }> {
    return this.oidcService.getJwks();
  }

  /**
   * Well-known configuration endpoint
   *
   * Provides tool configuration for platforms that support auto-registration
   */
  @Get('.well-known/openid-configuration')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'OpenID Connect configuration',
    description: 'Returns OpenID Connect discovery document for tool registration.',
  })
  async getOpenIdConfiguration(): Promise<Record<string, unknown>> {
    const baseUrl = process.env.APP_URL || 'https://gamilit.com';

    return {
      issuer: baseUrl,
      authorization_endpoint: `${baseUrl}/api/v1/lti/oidc/login`,
      token_endpoint: `${baseUrl}/api/v1/lti/oidc/token`,
      jwks_uri: `${baseUrl}/api/v1/lti/oidc/jwks`,
      registration_endpoint: `${baseUrl}/api/v1/lti/registration`,
      scopes_supported: [
        'openid',
        'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
        'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
        'https://purl.imsglobal.org/spec/lti-ags/scope/score',
        'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly',
      ],
      response_types_supported: ['id_token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      claims_supported: [
        'sub',
        'iss',
        'aud',
        'exp',
        'iat',
        'nonce',
        'name',
        'given_name',
        'family_name',
        'email',
        'locale',
      ],
      // LTI specific
      'https://purl.imsglobal.org/spec/lti-platform-configuration': {
        product_family_code: 'gamilit',
        version: '1.0.0',
        messages_supported: [
          {
            type: 'LtiResourceLinkRequest',
            placements: ['ContentArea', 'RichTextEditor'],
          },
          {
            type: 'LtiDeepLinkingRequest',
            placements: ['ContentArea'],
          },
        ],
        variables: [],
      },
    };
  }
}
