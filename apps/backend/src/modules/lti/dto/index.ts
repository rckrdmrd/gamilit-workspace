/**
 * LTI Module - DTOs Barrel Export
 *
 * @description Exporta todos los DTOs del módulo de integración LTI.
 * @module lti/dto
 */

// LtiConsumer DTOs
export { CreateLtiConsumerDto } from './create-lti-consumer.dto';
export { UpdateLtiConsumerDto } from './update-lti-consumer.dto';
export { LtiConsumerResponseDto } from './lti-consumer-response.dto';

// LtiSession DTOs
export { CreateLtiSessionDto } from './create-lti-session.dto';
export { LtiSessionResponseDto } from './lti-session-response.dto';

// LtiGradePassback DTOs
export { CreateLtiGradePassbackDto } from './create-lti-grade-passback.dto';
export { UpdateLtiGradePassbackDto } from './update-lti-grade-passback.dto';
export { LtiGradePassbackResponseDto } from './lti-grade-passback-response.dto';

// OIDC DTOs
export { OidcInitiateDto, OidcLoginResponseDto } from './oidc-initiate.dto';
export { OidcCallbackDto, LtiClaimsDto, LtiLaunchDataDto } from './oidc-callback.dto';

// Deep Linking DTOs
export {
  DeepLinkContentType,
  ContentFiltersDto,
  ContentItemDto,
  DeepLinkSelectionDto,
  LtiResourceLinkItemDto,
} from './deep-link-content.dto';
export {
  DeepLinkResponseDto,
  DeepLinkPayloadDto,
  ContentItem,
  DeepLinkReturnInfoDto,
} from './deep-link-response.dto';
