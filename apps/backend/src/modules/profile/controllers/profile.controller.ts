import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ProfileService } from '../services/profile.service';
import { UpdateProfileDto, ProfileResponseDto } from '../dto';

/**
 * ProfileController
 *
 * @description Controller for user profile operations
 *
 * Endpoints:
 * - GET /api/v1/profile/:userId - Get user profile by user ID
 * - PATCH /api/v1/profile/:userId - Update user profile
 * - POST /api/v1/profile/:userId/avatar - Upload user avatar
 *
 * @route /api/v1/profile
 */
@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * Get user profile by user ID
   *
   * @param userId - User ID (UUID)
   * @returns Profile data
   *
   * @example
   * GET /api/v1/profile/550e8400-e29b-41d4-a716-446655440000
   */
  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Retrieves the complete profile information for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID in UUID format',
    type: String,
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto,
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        tenant_id: '660e8400-e29b-41d4-a716-446655440000',
        display_name: 'John Doe',
        full_name: 'John Alexander Doe',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        avatar_url: 'https://storage.example.com/avatars/user123.jpg',
        bio: 'Student at Gamilit Academy',
        phone: '+525551234567',
        date_of_birth: '2010-05-15',
        grade_level: '6',
        student_id: 'STU2025001',
        school_id: null,
        role: 'student',
        status: 'active',
        email_verified: true,
        phone_verified: false,
        preferences: {
          theme: 'detective',
          language: 'es',
          timezone: 'America/Mexico_City',
          sound_enabled: true,
          notifications_enabled: true,
        },
        last_sign_in_at: '2025-01-26T10:30:00Z',
        last_activity_at: '2025-01-26T14:45:00Z',
        metadata: {},
        created_at: '2025-01-15T08:00:00Z',
        updated_at: '2025-01-26T14:45:00Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found for the specified user',
    schema: {
      example: {
        statusCode: 404,
        message: 'Profile not found for user 550e8400-e29b-41d4-a716-446655440000',
        error: 'Not Found',
      },
    },
  })
  async getProfile(@Param('userId') userId: string): Promise<ProfileResponseDto> {
    return this.profileService.getProfile(userId);
  }

  /**
   * Update user profile
   *
   * @param userId - User ID (UUID)
   * @param updateData - Profile fields to update
   * @returns Updated profile
   *
   * @example
   * PATCH /api/v1/profile/550e8400-e29b-41d4-a716-446655440000
   * Request: {
   *   "display_name": "Jane Smith",
   *   "bio": "Passionate about learning",
   *   "grade_level": "7"
   * }
   */
  @Patch(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Updates specific fields of a user profile. All fields are optional.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID in UUID format',
    type: String,
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateProfileDto,
    description: 'Fields to update in the profile',
    examples: {
      'Update basic info': {
        value: {
          display_name: 'Jane Smith',
          bio: 'Passionate about learning',
        },
      },
      'Update contact info': {
        value: {
          phone: '+525559876543',
          email: 'jane.new@example.com',
        },
      },
      'Update student info': {
        value: {
          grade_level: '7',
          student_id: 'STU2025002',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data provided',
    schema: {
      example: {
        statusCode: 400,
        message: 'Bio cannot exceed 500 characters',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  async updateProfile(
    @Param('userId') userId: string,
      @Body() updateData: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updateProfile(userId, updateData);
  }

  /**
   * Upload user avatar
   *
   * @param userId - User ID (UUID)
   * @param file - Avatar image file
   * @returns Updated profile with new avatar URL
   *
   * @example
   * POST /api/v1/profile/550e8400-e29b-41d4-a716-446655440000/avatar
   * Request: multipart/form-data with 'avatar' field
   */
  @Post(':userId/avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload user avatar',
    description:
      'Uploads a new avatar image for the user. Accepts image files (JPEG, PNG, GIF). Maximum size: 5MB.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID in UUID format',
    type: String,
    required: true,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file (JPEG, PNG, or GIF)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
    type: ProfileResponseDto,
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        avatar_url: 'https://storage.example.com/avatars/550e8400-e29b-41d4-a716-446655440000.jpg',
        updated_at: '2025-01-26T15:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or file size exceeds limit',
    schema: {
      example: {
        statusCode: 400,
        message: 'No file uploaded',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  async uploadAvatar(
    @Param('userId') userId: string,
      @UploadedFile() file: any, // eslint-disable-line @typescript-eslint/no-explicit-any -- Express.Multer.File requires @types/multer
  ): Promise<ProfileResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and GIF images are allowed.',
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    // Store avatar as base64 data URI in the database (MVP approach)
    // For production, migrate to cloud storage (S3, GCS, etc.)
    const base64 = file.buffer.toString('base64');
    const avatarUrl = `data:${file.mimetype};base64,${base64}`;

    return this.profileService.uploadAvatar(userId, avatarUrl);
  }
}
