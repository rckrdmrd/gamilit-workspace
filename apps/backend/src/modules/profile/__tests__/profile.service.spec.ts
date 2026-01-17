/**
 * ProfileService Unit Tests
 *
 * Tests for user profile management service.
 * Covers CRUD operations, validation, and error handling.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { Profile } from '../../auth/entities/profile.entity';

describe('ProfileService', () => {
  let service: ProfileService;
  let profileRepo: jest.Mocked<Repository<Profile>>;

  const mockProfileRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockProfile: Partial<Profile> = {
    id: 'profile-123',
    user_id: 'user-456',
    display_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    last_activity_at: new Date('2026-01-15'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(Profile, 'auth'),
          useValue: mockProfileRepo,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    profileRepo = module.get(getRepositoryToken(Profile, 'auth'));

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getProfile', () => {
    it('should return profile when found by user ID', async () => {
      // Arrange
      mockProfileRepo.findOne.mockResolvedValue(mockProfile as Profile);

      // Act
      const result = await service.getProfile('user-456');

      // Assert
      expect(result).toEqual(mockProfile);
      expect(mockProfileRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: 'user-456' },
      });
    });

    it('should throw NotFoundException when profile not found', async () => {
      // Arrange
      mockProfileRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getProfile('non-existent-user')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getProfile('non-existent-user')).rejects.toThrow(
        'Profile not found for user non-existent-user',
      );
    });
  });

  describe('getProfileById', () => {
    it('should return profile when found by profile ID', async () => {
      // Arrange
      mockProfileRepo.findOne.mockResolvedValue(mockProfile as Profile);

      // Act
      const result = await service.getProfileById('profile-123');

      // Assert
      expect(result).toEqual(mockProfile);
      expect(mockProfileRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'profile-123' },
      });
    });

    it('should throw NotFoundException when profile ID not found', async () => {
      // Arrange
      mockProfileRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getProfileById('non-existent-profile')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getProfileById('non-existent-profile')).rejects.toThrow(
        'Profile not found with ID non-existent-profile',
      );
    });
  });

  describe('updateProfile', () => {
    it('should update profile with valid data', async () => {
      // Arrange
      const updateData = { display_name: 'Updated Name', bio: 'New bio' };
      const updatedProfile = { ...mockProfile, ...updateData };
      mockProfileRepo.findOne.mockResolvedValue({ ...mockProfile } as Profile);
      mockProfileRepo.save.mockResolvedValue(updatedProfile as Profile);

      // Act
      const result = await service.updateProfile('user-456', updateData);

      // Assert
      expect(result.display_name).toBe('Updated Name');
      expect(result.bio).toBe('New bio');
      expect(mockProfileRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when bio exceeds 500 characters', async () => {
      // Arrange
      const longBio = 'a'.repeat(501);
      const updateData = { bio: longBio };
      mockProfileRepo.findOne.mockResolvedValue(mockProfile as Profile);

      // Act & Assert
      await expect(service.updateProfile('user-456', updateData)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateProfile('user-456', updateData)).rejects.toThrow(
        'Bio cannot exceed 500 characters',
      );
    });

    it('should allow bio at exactly 500 characters', async () => {
      // Arrange
      const exactBio = 'a'.repeat(500);
      const updateData = { bio: exactBio };
      const updatedProfile = { ...mockProfile, bio: exactBio };
      mockProfileRepo.findOne.mockResolvedValue({ ...mockProfile } as Profile);
      mockProfileRepo.save.mockResolvedValue(updatedProfile as Profile);

      // Act
      const result = await service.updateProfile('user-456', updateData);

      // Assert
      expect(result.bio).toBe(exactBio);
      expect(mockProfileRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user profile not found', async () => {
      // Arrange
      mockProfileRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateProfile('non-existent', { display_name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should merge update data with existing profile', async () => {
      // Arrange
      const existingProfile = { ...mockProfile };
      const updateData = { display_name: 'New Name' }; // Only update name
      mockProfileRepo.findOne.mockResolvedValue(existingProfile as Profile);
      mockProfileRepo.save.mockImplementation((profile) => Promise.resolve(profile));

      // Act
      const result = await service.updateProfile('user-456', updateData);

      // Assert
      expect(result.display_name).toBe('New Name');
      expect(result.bio).toBe(mockProfile.bio); // Bio should remain unchanged
    });
  });

  describe('uploadAvatar', () => {
    it('should update avatar URL', async () => {
      // Arrange
      const newAvatarUrl = 'https://storage.example.com/new-avatar.jpg';
      const existingProfile = { ...mockProfile };
      const updatedProfile = { ...mockProfile, avatar_url: newAvatarUrl };
      mockProfileRepo.findOne.mockResolvedValue(existingProfile as Profile);
      mockProfileRepo.save.mockResolvedValue(updatedProfile as Profile);

      // Act
      const result = await service.uploadAvatar('user-456', newAvatarUrl);

      // Assert
      expect(result.avatar_url).toBe(newAvatarUrl);
      expect(mockProfileRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      mockProfileRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.uploadAvatar('non-existent', 'https://example.com/avatar.jpg'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should replace existing avatar URL', async () => {
      // Arrange
      const existingProfile = {
        ...mockProfile,
        avatar_url: 'https://old-avatar.jpg'
      };
      const newAvatarUrl = 'https://new-avatar.jpg';
      mockProfileRepo.findOne.mockResolvedValue(existingProfile as Profile);
      mockProfileRepo.save.mockImplementation((profile) => Promise.resolve(profile));

      // Act
      const result = await service.uploadAvatar('user-456', newAvatarUrl);

      // Assert
      expect(result.avatar_url).toBe(newAvatarUrl);
    });
  });

  describe('updateLastActivity', () => {
    it('should update last activity timestamp', async () => {
      // Arrange
      const existingProfile = { ...mockProfile };
      mockProfileRepo.findOne.mockResolvedValue(existingProfile as Profile);
      mockProfileRepo.save.mockImplementation((profile) => Promise.resolve(profile));

      // Act
      const before = new Date();
      const result = await service.updateLastActivity('user-456');
      const after = new Date();

      // Assert
      expect(result.last_activity_at).toBeDefined();
      expect(result.last_activity_at!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result.last_activity_at!.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      mockProfileRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateLastActivity('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should save profile after updating activity', async () => {
      // Arrange
      const existingProfile = { ...mockProfile };
      mockProfileRepo.findOne.mockResolvedValue(existingProfile as Profile);
      mockProfileRepo.save.mockImplementation((profile) => Promise.resolve(profile));

      // Act
      await service.updateLastActivity('user-456');

      // Assert
      expect(mockProfileRepo.save).toHaveBeenCalledTimes(1);
    });
  });
});
