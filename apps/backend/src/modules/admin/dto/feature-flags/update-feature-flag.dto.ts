import { PartialType } from '@nestjs/swagger';
import { CreateFeatureFlagDto } from './create-feature-flag.dto';

/**
 * UpdateFeatureFlagDto
 *
 * @description DTO para actualizar una feature flag existente
 * @usedBy FeatureFlagsController.update()
 */
export class UpdateFeatureFlagDto extends PartialType(CreateFeatureFlagDto) {}
