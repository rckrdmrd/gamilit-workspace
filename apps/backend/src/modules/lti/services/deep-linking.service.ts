import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { LtiConsumer, LtiSession } from '../entities';
import { LtiSessionsService } from './lti-sessions.service';
import {
  ContentFiltersDto,
  ContentItemDto,
  DeepLinkSelectionDto,
} from '../dto/deep-link-content.dto';
import {
  DeepLinkResponseDto,
  DeepLinkPayloadDto,
  ContentItem,
  DeepLinkReturnInfoDto,
} from '../dto/deep-link-response.dto';
import { LtiClaimsDto } from '../dto/oidc-callback.dto';

/**
 * DeepLinkingService
 *
 * @description Handles LTI Deep Linking 2.0 functionality.
 * Allows instructors to select content from Gamilit to embed in their LMS.
 *
 * @see https://www.imsglobal.org/spec/lti-dl/v2p0
 */
@Injectable()
export class DeepLinkingService {
  private readonly logger = new Logger(DeepLinkingService.name);

  constructor(
    @InjectRepository(LtiConsumer, 'lti')
    private readonly consumerRepo: Repository<LtiConsumer>,
    @InjectRepository(LtiSession, 'lti')
    private readonly sessionRepo: Repository<LtiSession>,
    private readonly sessionsService: LtiSessionsService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get available content for deep linking
   *
   * @param filters - Filters to apply to content search
   * @param session - Current LTI session
   * @returns Array of available content items
   */
  async getAvailableContent(
    filters: ContentFiltersDto,
    session: LtiSession,
  ): Promise<ContentItemDto[]> {
    this.logger.log(`Fetching content for deep linking, session: ${session.id}`);

    const toolUrl = this.configService.get<string>('APP_URL') || 'https://gamilit.com';

    // In a real implementation, this would query the educational content database
    // For now, return mock content that demonstrates the structure
    const content: ContentItemDto[] = [
      {
        id: 'module-math-fractions',
        type: 'module',
        title: 'Fracciones - Curso Completo',
        description: 'Curso completo sobre operaciones con fracciones',
        thumbnailUrl: `${toolUrl}/assets/thumbnails/fractions.png`,
        difficulty: 'intermediate',
        durationMinutes: 120,
        supportsGradePassback: true,
        launchUrl: `${toolUrl}/lti/launch/module/math-fractions`,
        customParameters: {
          module_id: 'math-fractions',
        },
      },
      {
        id: 'exercise-fractions-add',
        type: 'exercise',
        title: 'Suma de Fracciones',
        description: 'Practica la suma de fracciones con denominadores iguales y diferentes',
        thumbnailUrl: `${toolUrl}/assets/thumbnails/add-fractions.png`,
        difficulty: 'beginner',
        durationMinutes: 15,
        maxPoints: 100,
        supportsGradePassback: true,
        launchUrl: `${toolUrl}/lti/launch/exercise/fractions-add`,
        customParameters: {
          exercise_id: 'fractions-add',
        },
      },
      {
        id: 'quiz-fractions-basic',
        type: 'quiz',
        title: 'Quiz: Fracciones Básicas',
        description: 'Evaluación de conocimientos básicos de fracciones',
        thumbnailUrl: `${toolUrl}/assets/thumbnails/quiz-fractions.png`,
        difficulty: 'beginner',
        durationMinutes: 20,
        maxPoints: 100,
        supportsGradePassback: true,
        launchUrl: `${toolUrl}/lti/launch/quiz/fractions-basic`,
        customParameters: {
          quiz_id: 'fractions-basic',
        },
      },
    ];

    // Apply filters (simplified)
    let filteredContent = content;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredContent = filteredContent.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          (item.description?.toLowerCase().includes(searchLower) ?? false),
      );
    }

    if (filters.contentType) {
      filteredContent = filteredContent.filter(
        (item) => item.type === filters.contentType,
      );
    }

    if (filters.difficulty) {
      filteredContent = filteredContent.filter(
        (item) => item.difficulty === filters.difficulty,
      );
    }

    return filteredContent;
  }

  /**
   * Create deep link response JWT
   *
   * @param dto - Selection data with content IDs
   * @param session - Current LTI session
   * @returns Deep link response with signed JWT
   */
  async createDeepLinkResponse(
    dto: DeepLinkSelectionDto,
    session: LtiSession,
  ): Promise<DeepLinkResponseDto> {
    this.logger.log(`Creating deep link response for session: ${dto.sessionId}`);

    // Verify session matches
    if (dto.sessionId !== session.id) {
      throw new BadRequestException('Session ID mismatch');
    }

    // Get deep linking settings from session claims
    const claims = session.idTokenClaims as unknown as LtiClaimsDto;
    const deepLinkingSettings = claims['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'];

    if (!deepLinkingSettings) {
      throw new BadRequestException('Deep linking settings not found in session');
    }

    // Get consumer for signing
    const consumer = await this.consumerRepo.findOne({
      where: { id: session.consumerId },
    });
    if (!consumer) {
      throw new NotFoundException('Consumer not found');
    }

    // Get content items for the selected IDs
    const contentItems = await this.buildContentItems(
      dto.contentIds,
      dto.customTitles,
      dto.customParameters,
    );

    // Validate selection against settings
    if (!deepLinkingSettings.accept_multiple && contentItems.length > 1) {
      throw new BadRequestException('Platform does not accept multiple items');
    }

    // Build and sign JWT
    const jwtToken = await this.signDeepLinkJwt(
      {
        contentItems,
        deploymentId: claims['https://purl.imsglobal.org/spec/lti/claim/deployment_id'],
        data: deepLinkingSettings.data,
      },
      consumer,
      claims,
    );

    return {
      jwt: jwtToken,
      returnUrl: deepLinkingSettings.deep_link_return_url,
      data: deepLinkingSettings.data,
    };
  }

  /**
   * Sign deep link JWT payload
   *
   * @param payload - Content items and metadata
   * @param consumer - LTI consumer
   * @param originalClaims - Original launch claims
   * @returns Signed JWT string
   */
  async signDeepLinkJwt(
    payload: {
      contentItems: ContentItem[];
      deploymentId: string;
      data?: string;
    },
    consumer: LtiConsumer,
    _originalClaims: LtiClaimsDto,
  ): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    const jwtPayload: DeepLinkPayloadDto = {
      iss: consumer.clientId,
      aud: consumer.platformId,
      exp: now + 300, // 5 minutes
      iat: now,
      nonce: uuidv4(),
      'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiDeepLinkingResponse',
      'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
      'https://purl.imsglobal.org/spec/lti/claim/deployment_id': payload.deploymentId,
      'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': payload.contentItems,
    };

    if (payload.data) {
      jwtPayload['https://purl.imsglobal.org/spec/lti-dl/claim/data'] = payload.data;
    }

    // Get private key for signing
    const privateKey = this.configService.get<string>('LTI_PRIVATE_KEY');
    if (!privateKey) {
      throw new BadRequestException('LTI private key not configured');
    }

    return jwt.sign(jwtPayload, privateKey, {
      algorithm: 'RS256',
      keyid: 'gamilit-lti-key-1',
    });
  }

  /**
   * Get return URL information for the session
   *
   * @param sessionId - LTI session ID
   * @returns Deep link return information
   */
  async getReturnInfo(sessionId: string): Promise<DeepLinkReturnInfoDto> {
    const session = await this.sessionsService.findOne(sessionId);
    const claims = session.idTokenClaims as unknown as LtiClaimsDto;
    const deepLinkingSettings = claims['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'];

    if (!deepLinkingSettings) {
      throw new BadRequestException('Not a deep linking session');
    }

    return {
      returnUrl: deepLinkingSettings.deep_link_return_url,
      acceptTypes: deepLinkingSettings.accept_types,
      acceptMultiple: deepLinkingSettings.accept_multiple ?? true,
      autoCreate: deepLinkingSettings.auto_create,
      title: deepLinkingSettings.title,
      text: deepLinkingSettings.text,
      data: deepLinkingSettings.data,
    };
  }

  /**
   * Build content items from selection
   */
  private async buildContentItems(
    contentIds: string[],
    customTitles?: Record<string, string>,
    customParameters?: Record<string, Record<string, string>>,
  ): Promise<ContentItem[]> {
    const toolUrl = this.configService.get<string>('APP_URL') || 'https://gamilit.com';

    // In production, fetch actual content from database
    // For now, build items from IDs with mock data
    return contentIds.map((id) => {
      const item: ContentItem = {
        type: 'ltiResourceLink',
        title: customTitles?.[id] || this.getTitleFromId(id),
        url: `${toolUrl}/lti/launch/content/${id}`,
        custom: {
          content_id: id,
          ...(customParameters?.[id] || {}),
        },
      };

      // Add line item for gradeable content
      if (this.isGradeableContent(id)) {
        item.lineItem = {
          label: item.title || 'Gamilit Activity',
          scoreMaximum: 100,
          resourceId: id,
        };
      }

      return item;
    });
  }

  /**
   * Get title from content ID (placeholder - query DB in production)
   */
  private getTitleFromId(id: string): string {
    // Mock implementation
    const titles: Record<string, string> = {
      'module-math-fractions': 'Fracciones - Curso Completo',
      'exercise-fractions-add': 'Suma de Fracciones',
      'quiz-fractions-basic': 'Quiz: Fracciones Básicas',
    };
    return titles[id] || `Gamilit Content: ${id}`;
  }

  /**
   * Check if content supports grade passback
   */
  private isGradeableContent(id: string): boolean {
    // Mock implementation - check content type
    return id.startsWith('exercise-') || id.startsWith('quiz-');
  }

  /**
   * Cancel deep linking and return to LMS
   *
   * @param sessionId - LTI session ID
   * @returns Cancel response with return URL
   */
  async cancelDeepLinking(sessionId: string): Promise<DeepLinkResponseDto> {
    const session = await this.sessionsService.findOne(sessionId);
    const claims = session.idTokenClaims as unknown as LtiClaimsDto;
    const deepLinkingSettings = claims['https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'];

    if (!deepLinkingSettings) {
      throw new BadRequestException('Not a deep linking session');
    }

    const consumer = await this.consumerRepo.findOne({
      where: { id: session.consumerId },
    });
    if (!consumer) {
      throw new NotFoundException('Consumer not found');
    }

    // Create empty response (cancelled)
    const jwtToken = await this.signDeepLinkJwt(
      {
        contentItems: [],
        deploymentId: claims['https://purl.imsglobal.org/spec/lti/claim/deployment_id'],
        data: deepLinkingSettings.data,
      },
      consumer,
      claims,
    );

    // End session
    await this.sessionsService.endSession(sessionId);

    return {
      jwt: jwtToken,
      returnUrl: deepLinkingSettings.deep_link_return_url,
      data: deepLinkingSettings.data,
    };
  }
}
