import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../../auth/entities/profile.entity';
import { UpdateProfileDto } from '../dto';

/**
 * ProfileService
 *
 * @description Service for managing user profiles
 *
 * Responsibilities:
 * - Get user profile by ID
 * - Update user profile information
 * - Upload and update user avatar
 *
 * @see Profile Entity
 * @see ProfileController
 */
@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
  ) {}

  /**
   * Get user profile by user ID
   *
   * @param userId - User ID (UUID)
   * @returns Profile entity
   * @throws NotFoundException if profile doesn't exist
   *
   * @example
   * const profile = await profileService.getProfile('550e8400-e29b-41d4-a716-446655440000');
   */
  async getProfile(userId: string): Promise<Profile> {
    // DB-125: Try profile.id first (JWT sub = profiles.id)
    const profileById = await this.profileRepo.findOne({
      where: { id: userId },
    });

    if (profileById) {
      return profileById;
    }

    // Fallback: userId might be auth.users.id
    const profileByUserId = await this.profileRepo.findOne({
      where: { user_id: userId },
    });

    if (!profileByUserId) {
      throw new NotFoundException(`Profile not found for user ${userId}`);
    }

    return profileByUserId;
  }

  /**
   * Get profile by profile ID
   *
   * @param profileId - Profile ID (UUID)
   * @returns Profile entity
   * @throws NotFoundException if profile doesn't exist
   */
  async getProfileById(profileId: string): Promise<Profile> {
    const profile = await this.profileRepo.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException(`Profile not found with ID ${profileId}`);
    }

    return profile;
  }

  /**
   * Update user profile
   *
   * @param userId - User ID (UUID)
   * @param updateData - Partial profile data to update
   * @returns Updated profile entity
   * @throws NotFoundException if profile doesn't exist
   * @throws BadRequestException if validation fails
   *
   * @example
   * const updated = await profileService.updateProfile(
   *   '550e8400-e29b-41d4-a716-446655440000',
   *   { display_name: 'New Name', bio: 'Updated bio' }
   * );
   */
  async updateProfile(userId: string, updateData: UpdateProfileDto): Promise<Profile> {
    const profile = await this.getProfile(userId);

    // Validate bio length if provided (max 500 chars as per DB constraint)
    if (updateData.bio && updateData.bio.length > 500) {
      throw new BadRequestException('Bio cannot exceed 500 characters');
    }

    // Merge update data with existing profile
    Object.assign(profile, updateData);

    // Save and return updated profile
    return this.profileRepo.save(profile);
  }

  /**
   * Upload and update user avatar
   *
   * @param userId - User ID (UUID)
   * @param avatarUrl - URL of the uploaded avatar image
   * @returns Updated profile with new avatar URL
   * @throws NotFoundException if profile doesn't exist
   *
   * @example
   * const updated = await profileService.uploadAvatar(
   *   '550e8400-e29b-41d4-a716-446655440000',
   *   'https://storage.example.com/avatars/user123.jpg'
   * );
   */
  async uploadAvatar(userId: string, avatarUrl: string): Promise<Profile> {
    const profile = await this.getProfile(userId);

    profile.avatar_url = avatarUrl;

    return this.profileRepo.save(profile);
  }

  /**
   * Update last activity timestamp
   *
   * @param userId - User ID (UUID)
   * @returns Updated profile
   *
   * @internal Used by auth middleware to track user activity
   */
  async updateLastActivity(userId: string): Promise<Profile> {
    const profile = await this.getProfile(userId);

    profile.last_activity_at = new Date();

    return this.profileRepo.save(profile);
  }
}
