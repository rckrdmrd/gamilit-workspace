/**
 * Gamification Config DTOs
 *
 * @module admin/dto/gamification-config
 * @description Data Transfer Objects for gamification configuration management
 */

export {
  UpdateGamificationSettingsDto,
  XpSettingsDto,
  RankThresholdsDto,
  CoinsSettingsDto,
} from './update-gamification-settings.dto';

export { GamificationSettingsResponseDto } from './gamification-settings-response.dto';

export {
  PreviewImpactDto,
  PreviewImpactResultDto,
  RankChangesDto,
  XpImpactDto,
  CoinsImpactDto,
  RestoreDefaultsResultDto,
} from './preview-impact.dto';

// US-AE-005: New DTOs for parameter-based endpoints
export { ListParametersQueryDto } from './list-parameters-query.dto';

export {
  ParameterResponseDto,
  ParametersListResponseDto,
} from './parameter-response.dto';

export {
  UpdateParameterDto,
  UpdateParameterResponseDto,
} from './update-parameter.dto';

export {
  MayaRankDto,
  MayaRanksResponseDto,
} from './maya-rank-response.dto';

export {
  UpdateMayaRankDto,
  UpdateMayaRankResponseDto,
} from './update-maya-rank.dto';
