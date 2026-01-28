import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { DeepLinkingService } from '../services/deep-linking.service';
import { LtiSessionsService } from '../services/lti-sessions.service';
import {
  ContentFiltersDto,
  ContentItemDto,
  DeepLinkSelectionDto,
} from '../dto/deep-link-content.dto';
import {
  DeepLinkResponseDto,
  DeepLinkReturnInfoDto,
} from '../dto/deep-link-response.dto';

/**
 * DeepLinkingController
 *
 * @description Handles LTI Deep Linking 2.0 content selection.
 *
 * Flow:
 * 1. GET /content - Fetch available content for selection
 * 2. POST /select - Select content items and get signed JWT response
 * 3. GET /return - Get return URL info for the session
 *
 * @route /lti/deep-linking
 */
@ApiTags('LTI Deep Linking')
@Controller('api/v1/lti/deep-linking')
export class DeepLinkingController {
  private readonly logger = new Logger(DeepLinkingController.name);

  constructor(
    private readonly deepLinkingService: DeepLinkingService,
    private readonly sessionsService: LtiSessionsService,
  ) {}

  /**
   * Get available content for deep linking
   *
   * Returns a list of content items that can be linked from the LMS.
   */
  @Get('content')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get available content',
    description: 'Returns content items available for deep linking selection.',
  })
  @ApiQuery({ name: 'sessionId', description: 'LTI session ID', required: true })
  @ApiQuery({ name: 'moduleId', description: 'Filter by module ID', required: false })
  @ApiQuery({ name: 'topicId', description: 'Filter by topic ID', required: false })
  @ApiQuery({ name: 'contentType', description: 'Filter by content type', required: false })
  @ApiQuery({ name: 'difficulty', description: 'Filter by difficulty', required: false })
  @ApiQuery({ name: 'search', description: 'Search query', required: false })
  @ApiResponse({
    status: 200,
    description: 'List of available content items',
    type: [ContentItemDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Session not found',
  })
  async getAvailableContent(
    @Query('sessionId') sessionId: string,
    @Query() filters: ContentFiltersDto,
  ): Promise<ContentItemDto[]> {
    this.logger.log(`Fetching content for session: ${sessionId}`);

    // Verify session exists and is a deep linking session
    const session = await this.sessionsService.findOne(sessionId);

    if (session.messageType !== 'LtiDeepLinkingRequest') {
      this.logger.warn(`Session ${sessionId} is not a deep linking session`);
    }

    // Update session activity
    await this.sessionsService.updateActivity(sessionId);

    return this.deepLinkingService.getAvailableContent(filters, session);
  }

  /**
   * Select content items for deep linking
   *
   * Creates a signed JWT response to send back to the LMS.
   */
  @Post('select')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Select content for deep linking',
    description: 'Creates a signed JWT response with selected content items.',
  })
  @ApiResponse({
    status: 200,
    description: 'Deep link response with signed JWT',
    type: DeepLinkResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid selection or session',
  })
  async selectContent(
    @Body() dto: DeepLinkSelectionDto,
  ): Promise<DeepLinkResponseDto> {
    this.logger.log(`Content selection for session: ${dto.sessionId}`);

    const session = await this.sessionsService.findOne(dto.sessionId);
    return this.deepLinkingService.createDeepLinkResponse(dto, session);
  }

  /**
   * Submit selection and redirect to LMS
   *
   * Alternative endpoint that directly submits to LMS via redirect.
   */
  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit selection and redirect',
    description: 'Creates response and returns HTML form for auto-submit to LMS.',
  })
  @ApiResponse({
    status: 200,
    description: 'HTML form for auto-submission',
    content: {
      'text/html': {
        schema: {
          type: 'string',
        },
      },
    },
  })
  async submitSelection(
    @Body() dto: DeepLinkSelectionDto,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(`Submitting selection for session: ${dto.sessionId}`);

    const session = await this.sessionsService.findOne(dto.sessionId);
    const response = await this.deepLinkingService.createDeepLinkResponse(dto, session);

    // End the session after successful submission
    await this.sessionsService.endSession(dto.sessionId);

    // Return auto-submitting form
    const html = this.buildAutoSubmitForm(response.returnUrl, response.jwt);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  /**
   * Get return URL information
   *
   * Returns the deep linking settings for the session.
   */
  @Get('return/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get return URL info',
    description: 'Returns deep linking return URL and settings for the session.',
  })
  @ApiParam({ name: 'sessionId', description: 'LTI session ID' })
  @ApiResponse({
    status: 200,
    description: 'Return URL information',
    type: DeepLinkReturnInfoDto,
  })
  async getReturnUrl(
    @Param('sessionId') sessionId: string,
  ): Promise<DeepLinkReturnInfoDto> {
    return this.deepLinkingService.getReturnInfo(sessionId);
  }

  /**
   * Cancel deep linking and return to LMS
   */
  @Post('cancel/:sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel deep linking',
    description: 'Cancels selection and returns empty response to LMS.',
  })
  @ApiParam({ name: 'sessionId', description: 'LTI session ID' })
  @ApiResponse({
    status: 200,
    description: 'Cancel response',
    type: DeepLinkResponseDto,
  })
  async cancelSelection(
    @Param('sessionId') sessionId: string,
  ): Promise<DeepLinkResponseDto> {
    this.logger.log(`Cancelling deep linking for session: ${sessionId}`);
    return this.deepLinkingService.cancelDeepLinking(sessionId);
  }

  /**
   * Cancel and redirect to LMS
   */
  @Get('cancel/:sessionId/redirect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel and redirect',
    description: 'Cancels selection and redirects to LMS with empty response.',
  })
  @ApiParam({ name: 'sessionId', description: 'LTI session ID' })
  async cancelAndRedirect(
    @Param('sessionId') sessionId: string,
    @Res() res: Response,
  ): Promise<void> {
    this.logger.log(`Cancelling and redirecting for session: ${sessionId}`);

    const response = await this.deepLinkingService.cancelDeepLinking(sessionId);

    const html = this.buildAutoSubmitForm(response.returnUrl, response.jwt);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  /**
   * Build auto-submitting HTML form
   */
  private buildAutoSubmitForm(returnUrl: string, jwt: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Returning to LMS...</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .loading {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e0e0e0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner"></div>
    <p>Returning to your LMS...</p>
  </div>
  <form id="lti-form" method="POST" action="${this.escapeHtml(returnUrl)}">
    <input type="hidden" name="JWT" value="${this.escapeHtml(jwt)}" />
  </form>
  <script>
    document.getElementById('lti-form').submit();
  </script>
</body>
</html>
`;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
