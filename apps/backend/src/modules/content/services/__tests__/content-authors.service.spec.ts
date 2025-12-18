/**
 * ContentAuthorsService Unit Tests
 *
 * @description Tests for content authors management service covering:
 * - CRUD operations for author profiles
 * - User ID uniqueness validation
 * - Featured and verified authors
 * - Author rating management
 * - Content tracking (created vs published)
 * - Expertise area filtering
 * - Author statistics
 *
 * Sprint 1 - P1-021: Increase coverage to 50%
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ContentAuthorsService } from '../content-authors.service';
import { ContentAuthor } from '../../entities';
import { createMockRepository, createMockQueryBuilder } from '@/__mocks__/repositories.mock';
import { TestDataFactory } from '@/__mocks__/services.mock';

describe('ContentAuthorsService', () => {
  let service: ContentAuthorsService;
  let authorRepo: ReturnType<typeof createMockRepository>;

  // Test data
  const mockUserId = TestDataFactory.createUuid('user');
  const mockAuthorId = TestDataFactory.createUuid('author');

  const mockAuthor = {
    id: mockAuthorId,
    user_id: mockUserId,
    display_name: 'Dr. John Doe',
    bio: 'Expert in mathematics and physics',
    expertise_areas: ['mathematics', 'physics', 'calculus'],
    total_content_created: 15,
    total_content_published: 12,
    average_rating: 4.5,
    is_featured: true,
    is_verified: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    authorRepo = createMockRepository<ContentAuthor>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentAuthorsService,
        {
          provide: getRepositoryToken(ContentAuthor, 'content'),
          useValue: authorRepo,
        },
      ],
    }).compile();

    service = module.get<ContentAuthorsService>(ContentAuthorsService);
    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  // =========================================================================
  // CREATE OPERATION
  // =========================================================================

  describe('create', () => {
    const displayName = 'Dr. Jane Smith';
    const bio = 'Expert in biology';
    const expertiseAreas = ['biology', 'genetics'];

    beforeEach(() => {
      authorRepo.findOne.mockResolvedValue(null);
      authorRepo.create.mockReturnValue(mockAuthor as any);
      authorRepo.save.mockResolvedValue(mockAuthor as any);
    });

    it('should create new author profile successfully', async () => {
      const result = await service.create(mockUserId, displayName, bio, expertiseAreas);

      expect(result).toEqual(mockAuthor);
      expect(authorRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: mockUserId },
      });
      expect(authorRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          display_name: displayName,
          bio,
          expertise_areas: expertiseAreas,
          total_content_created: 0,
          total_content_published: 0,
          is_featured: false,
          is_verified: false,
        }),
      );
      expect(authorRepo.save).toHaveBeenCalled();
    });

    it('should create author with default empty expertise areas', async () => {
      await service.create(mockUserId, displayName);

      expect(authorRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          expertise_areas: [],
        }),
      );
    });

    it('should throw ConflictException if user already has author profile', async () => {
      authorRepo.findOne.mockResolvedValue(mockAuthor as any);

      await expect(service.create(mockUserId, displayName)).rejects.toThrow(ConflictException);
      await expect(service.create(mockUserId, displayName)).rejects.toThrow(
        'User already has an author profile',
      );
    });
  });

  // =========================================================================
  // FIND OPERATIONS
  // =========================================================================

  describe('findAll', () => {
    const mockAuthors = [mockAuthor, { ...mockAuthor, id: 'another-author' }];
    let mockQueryBuilder: any;

    beforeEach(() => {
      mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue(mockAuthors);
      authorRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return all authors without filters', async () => {
      const result = await service.findAll();

      expect(result).toEqual(mockAuthors);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('a.average_rating', 'DESC', 'NULLS LAST');
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith('a.total_content_published', 'DESC');
    });

    it('should filter by is_featured', async () => {
      await service.findAll({ is_featured: true });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'a.is_featured = :featured',
        { featured: true },
      );
    });

    it('should filter by is_verified', async () => {
      await service.findAll({ is_verified: true });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'a.is_verified = :verified',
        { verified: true },
      );
    });

    it('should filter by expertise_area', async () => {
      await service.findAll({ expertise_area: 'mathematics' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        ':expertise = ANY(a.expertise_areas)',
        { expertise: 'mathematics' },
      );
    });

    it('should apply multiple filters', async () => {
      await service.findAll({
        is_featured: true,
        is_verified: true,
        expertise_area: 'physics',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  describe('findById', () => {
    it('should return author by ID', async () => {
      authorRepo.findOne.mockResolvedValue(mockAuthor as any);

      const result = await service.findById(mockAuthorId);

      expect(result).toEqual(mockAuthor);
      expect(authorRepo.findOne).toHaveBeenCalledWith({ where: { id: mockAuthorId } });
    });

    it('should throw NotFoundException if author not found', async () => {
      authorRepo.findOne.mockResolvedValue(null);

      await expect(service.findById(mockAuthorId)).rejects.toThrow(NotFoundException);
      await expect(service.findById(mockAuthorId)).rejects.toThrow(
        `ContentAuthor with ID ${mockAuthorId} not found`,
      );
    });
  });

  describe('findByUserId', () => {
    it('should return author by user ID', async () => {
      authorRepo.findOne.mockResolvedValue(mockAuthor as any);

      const result = await service.findByUserId(mockUserId);

      expect(result).toEqual(mockAuthor);
      expect(authorRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: mockUserId },
      });
    });

    it('should throw NotFoundException if author not found', async () => {
      authorRepo.findOne.mockResolvedValue(null);

      await expect(service.findByUserId(mockUserId)).rejects.toThrow(NotFoundException);
      await expect(service.findByUserId(mockUserId)).rejects.toThrow(
        `Author profile not found for user ${mockUserId}`,
      );
    });
  });


  describe('findFeatured', () => {
    it('should return featured authors', async () => {
      const featuredAuthors = [mockAuthor];
      authorRepo.find.mockResolvedValue(featuredAuthors as any);

      const result = await service.findFeatured(5);

      expect(result).toEqual(featuredAuthors);
      expect(authorRepo.find).toHaveBeenCalledWith({
        where: { is_featured: true },
        order: { average_rating: 'DESC', total_content_published: 'DESC' },
        take: 5,
      });
    });

    it('should use default limit of 10', async () => {
      authorRepo.find.mockResolvedValue([mockAuthor] as any);

      await service.findFeatured();

      expect(authorRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });

  describe('findVerified', () => {
    let mockQueryBuilder: any;

    beforeEach(() => {
      mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue([mockAuthor]);
      authorRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return verified authors', async () => {
      const result = await service.findVerified();

      expect(result).toEqual([mockAuthor]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'a.is_verified = :verified',
        { verified: true },
      );
    });

    it('should apply limit if provided', async () => {
      await service.findVerified(20);

      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });

    it('should not apply limit if not provided', async () => {
      await service.findVerified();

      expect(mockQueryBuilder.take).not.toHaveBeenCalled();
    });
  });

  describe('findByExpertise', () => {
    let mockQueryBuilder: any;

    beforeEach(() => {
      mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue([mockAuthor]);
      authorRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return authors by expertise area', async () => {
      const result = await service.findByExpertise('mathematics');

      expect(result).toEqual([mockAuthor]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        ':expertise = ANY(a.expertise_areas)',
        { expertise: 'mathematics' },
      );
    });
  });

  // =========================================================================
  // UPDATE OPERATIONS
  // =========================================================================

  describe('update', () => {
    beforeEach(() => {
      authorRepo.findOne.mockResolvedValue(mockAuthor as any);
      authorRepo.save.mockResolvedValue(mockAuthor as any);
    });

    it('should update author profile', async () => {
      const updateData = {
        display_name: 'Prof. John Doe',
        bio: 'Updated bio',
        expertise_areas: ['mathematics', 'statistics'],
      };

      const result = await service.update(mockAuthorId, updateData);

      expect(result.display_name).toBe(updateData.display_name);
      expect(result.bio).toBe(updateData.bio);
      expect(result.expertise_areas).toEqual(updateData.expertise_areas);
      expect(authorRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if author not found', async () => {
      authorRepo.findOne.mockResolvedValue(null);

      await expect(service.update(mockAuthorId, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('incrementContentCreated', () => {
    beforeEach(() => {
      authorRepo.findOne.mockResolvedValue(mockAuthor as any);
      authorRepo.save.mockResolvedValue(mockAuthor as any);
    });

    it('should increment content created counter', async () => {
      const result = await service.incrementContentCreated(mockUserId);

      expect(result.total_content_created).toBe(16);
      expect(authorRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if author not found', async () => {
      authorRepo.findOne.mockResolvedValue(null);

      await expect(service.incrementContentCreated(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('incrementContentPublished', () => {
    beforeEach(() => {
      authorRepo.findOne.mockResolvedValue(mockAuthor as any);
      authorRepo.save.mockResolvedValue(mockAuthor as any);
    });

    it('should increment content published counter', async () => {
      const result = await service.incrementContentPublished(mockUserId);

      expect(result.total_content_published).toBe(13);
      expect(authorRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if author not found', async () => {
      authorRepo.findOne.mockResolvedValue(null);

      await expect(service.incrementContentPublished(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateRating', () => {
    beforeEach(() => {
      authorRepo.findOne.mockResolvedValue(mockAuthor as any);
      authorRepo.save.mockResolvedValue(mockAuthor as any);
    });

    it('should update author rating', async () => {
      const newRating = 4.8;
      const result = await service.updateRating(mockAuthorId, newRating);

      expect(result.average_rating).toBe(newRating);
      expect(authorRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if rating is negative', async () => {
      await expect(service.updateRating(mockAuthorId, -1)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.updateRating(mockAuthorId, -1)).rejects.toThrow(
        'Rating must be between 0 and 5',
      );
    });

    it('should throw BadRequestException if rating is over 5', async () => {
      await expect(service.updateRating(mockAuthorId, 6)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should accept rating of 0', async () => {
      const result = await service.updateRating(mockAuthorId, 0);

      expect(result.average_rating).toBe(0);
    });

    it('should accept rating of 5', async () => {
      const result = await service.updateRating(mockAuthorId, 5);

      expect(result.average_rating).toBe(5);
    });
  });

  describe('setFeatured', () => {
    beforeEach(() => {
      authorRepo.findOne.mockResolvedValue(mockAuthor as any);
      authorRepo.save.mockResolvedValue(mockAuthor as any);
    });

    it('should mark author as featured', async () => {
      const result = await service.setFeatured(mockAuthorId, true);

      expect(result.is_featured).toBe(true);
      expect(authorRepo.save).toHaveBeenCalled();
    });

    it('should unmark author as featured', async () => {
      const result = await service.setFeatured(mockAuthorId, false);

      expect(result.is_featured).toBe(false);
    });
  });

  describe('setVerified', () => {
    beforeEach(() => {
      authorRepo.findOne.mockResolvedValue(mockAuthor as any);
      authorRepo.save.mockResolvedValue(mockAuthor as any);
    });

    it('should mark author as verified', async () => {
      const result = await service.setVerified(mockAuthorId, true);

      expect(result.is_verified).toBe(true);
      expect(authorRepo.save).toHaveBeenCalled();
    });

    it('should unmark author as verified', async () => {
      const result = await service.setVerified(mockAuthorId, false);

      expect(result.is_verified).toBe(false);
    });
  });

  // =========================================================================
  // DELETE OPERATION
  // =========================================================================

  describe('delete', () => {
    beforeEach(() => {
      authorRepo.findOne.mockResolvedValue(mockAuthor as any);
      authorRepo.remove.mockResolvedValue(mockAuthor as any);
    });

    it('should delete author profile', async () => {
      await service.delete(mockAuthorId);

      expect(authorRepo.remove).toHaveBeenCalledWith(mockAuthor);
    });

    it('should throw NotFoundException if author not found', async () => {
      authorRepo.findOne.mockResolvedValue(null);

      await expect(service.delete(mockAuthorId)).rejects.toThrow(NotFoundException);
    });
  });

  // =========================================================================
  // STATISTICS
  // =========================================================================

  describe('getStats', () => {
    let mockQueryBuilder: any;

    beforeEach(() => {
      mockQueryBuilder = createMockQueryBuilder();
      authorRepo.count.mockResolvedValue(50);
      authorRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    });

    it('should return author statistics', async () => {
      authorRepo.count
        .mockResolvedValueOnce(50) // total
        .mockResolvedValueOnce(30) // verified
        .mockResolvedValueOnce(10); // featured

      mockQueryBuilder.getCount.mockResolvedValue(40); // with_content
      mockQueryBuilder.getRawOne.mockResolvedValue({ avg: '4.3' });

      const result = await service.getStats();

      expect(result).toEqual({
        total: 50,
        verified: 30,
        featured: 10,
        with_content: 40,
        average_rating: 4.3,
      });
    });

    it('should handle null average rating', async () => {
      authorRepo.count.mockResolvedValue(0);
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawOne.mockResolvedValue(null);

      const result = await service.getStats();

      expect(result.average_rating).toBe(0);
    });
  });
});
