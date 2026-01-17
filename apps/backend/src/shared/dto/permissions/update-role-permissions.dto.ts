import { ApiProperty } from '@nestjs/swagger';
import {
  IsObject,
  IsNotEmpty,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate,
} from 'class-validator';
import { VALID_PERMISSION_KEYS } from '@shared/constants';

/**
 * FIX-2025-01-07 P0: Custom validator for permissions object
 * Validates that:
 * 1. All keys are valid permission keys from PermissionKeyEnum
 * 2. All values are booleans
 */
@ValidatorConstraint({ name: 'validPermissions', async: false })
export class ValidPermissionsConstraint implements ValidatorConstraintInterface {
  validate(permissions: Record<string, unknown>, _args: ValidationArguments): boolean {
    if (!permissions || typeof permissions !== 'object') {
      return false;
    }

    const keys = Object.keys(permissions);

    // Validate all keys are valid permission keys
    for (const key of keys) {
      if (!VALID_PERMISSION_KEYS.includes(key as any)) {
        return false;
      }

      // Validate all values are booleans
      if (typeof permissions[key] !== 'boolean') {
        return false;
      }
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    const permissions = args.value as Record<string, unknown>;

    if (!permissions || typeof permissions !== 'object') {
      return 'Permissions must be an object';
    }

    const keys = Object.keys(permissions);

    // Check for invalid keys
    const invalidKeys = keys.filter((key) => !VALID_PERMISSION_KEYS.includes(key as any));
    if (invalidKeys.length > 0) {
      return `Invalid permission keys: ${invalidKeys.join(', ')}. Valid keys are: ${VALID_PERMISSION_KEYS.join(', ')}`;
    }

    // Check for non-boolean values
    const nonBooleanKeys = keys.filter((key) => typeof permissions[key] !== 'boolean');
    if (nonBooleanKeys.length > 0) {
      return `Permission values must be booleans. Non-boolean values found for: ${nonBooleanKeys.join(', ')}`;
    }

    return 'Invalid permissions format';
  }
}

/**
 * DTO for updating role permissions
 *
 * @description Used by admins to update permissions for a role
 * @version 2.0 (FIX-2025-01-07) - Added validation for valid permission keys and boolean values
 */
export class UpdateRolePermissionsDto {
  @ApiProperty({
    description: 'Updated permissions in JSON format. Keys must be valid permission keys, values must be booleans.',
    example: {
      can_create_content: true,
      can_delete_users: false,
      can_manage_settings: true,
      can_view_reports: true,
    },
  })
  @IsObject()
  @IsNotEmpty()
  @Validate(ValidPermissionsConstraint, {
    message: 'Permissions must contain only valid permission keys with boolean values',
  })
    permissions!: Record<string, boolean>;
}
