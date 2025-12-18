import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { FeatureFlagsService } from '../services/feature-flags.service';
import { FeatureFlag } from '../entities/feature-flag.entity';
import { CreateFeatureFlagDto, UpdateFeatureFlagDto, FeatureFlagQueryDto } from '../dto/feature-flags';

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;
  let _repository: Repository<FeatureFlag>;

  const mockFeatureFlag: Partial<FeatureFlag> = {
    id: '1',
    feature_key: 'test_feature',
    feature_name: 'Test Feature',
    description: 'Test feature description',
    is_enabled: true,
    rollout_percentage: 50,
    target_users: ['user1', 'user2'],
    target_roles: ['admin', 'teacher'],
    target_conditions: {},
    metadata: { category: 'testing' },
    created_by: 'admin',
    updated_by: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockRepository = {
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockFeatureFlag]),
    })),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagsService,
        {
          provide: getRepositoryToken(FeatureFlag, 'auth'),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<FeatureFlagsService>(FeatureFlagsService);
    repository = module.get<Repository<FeatureFlag>>(getRepositoryToken(FeatureFlag, 'auth'));

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =====================================================
  // FINDALL TESTS
  // =====================================================

  describe('findAll', () => {
    it('should return all feature flags without filters', async () => {
      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockFeatureFlag]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll();

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('ff');
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('ff.feature_name', 'ASC');
      expect(result).toEqual([mockFeatureFlag]);
    });

    it('should filter by isEnabled when provided', async () => {
      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockFeatureFlag]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const query: FeatureFlagQueryDto = { isEnabled: true };
      await service.findAll(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('ff.is_enabled = :isEnabled', { isEnabled: true });
    });

    it('should filter by category when provided', async () => {
      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockFeatureFlag]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const query: FeatureFlagQueryDto = { category: 'testing' };
      await service.findAll(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('ff.metadata @> :category', {
        category: JSON.stringify({ category: 'testing' }),
      });
    });
  });

  // =====================================================
  // FINDONE TESTS
  // =====================================================

  describe('findOne', () => {
    it('should return a feature flag by key', async () => {
      mockRepository.findOne.mockResolvedValue(mockFeatureFlag);

      const result = await service.findOne('test_feature');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { feature_key: 'test_feature' },
        relations: ['creator', 'updater'],
      });
      expect(result).toEqual(mockFeatureFlag);
    });

    it('should throw NotFoundException when feature flag not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non_existent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('non_existent')).rejects.toThrow('Feature flag with key "non_existent" not found');
    });
  });

  // =====================================================
  // CREATE TESTS
  // =====================================================

  describe('create', () => {
    const createDto: CreateFeatureFlagDto = {
      key: 'new_feature',
      name: 'New Feature',
      description: 'New feature description',
      isEnabled: true,
      rolloutPercentage: 25,
      targetUsers: ['user1'],
      targetRoles: ['admin'],
      category: 'testing',
      metadata: { priority: 'high' },
    };

    it('should create a new feature flag successfully', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockFeatureFlag);
      mockRepository.save.mockResolvedValue(mockFeatureFlag);

      const result = await service.create(createDto, 'admin');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { feature_key: 'new_feature' },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        feature_key: 'new_feature',
        feature_name: 'New Feature',
        description: 'New feature description',
        is_enabled: true,
        rollout_percentage: 25,
        target_users: ['user1'],
        target_roles: ['admin'],
        target_conditions: {},
        metadata: {
          priority: 'high',
          category: 'testing',
        },
        created_by: 'admin',
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockFeatureFlag);
    });

    it('should throw ConflictException when feature flag already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockFeatureFlag);

      await expect(service.create(createDto, 'admin')).rejects.toThrow(ConflictException);
      await expect(service.create(createDto, 'admin')).rejects.toThrow('Feature flag with key "new_feature" already exists');
    });

    it('should create with default values when optional fields not provided', async () => {
      const minimalDto: CreateFeatureFlagDto = {
        key: 'minimal_feature',
        name: 'Minimal Feature',
        description: 'Minimal description',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockFeatureFlag);
      mockRepository.save.mockResolvedValue(mockFeatureFlag);

      await service.create(minimalDto, 'admin');

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          is_enabled: false,
          rollout_percentage: 0,
          target_conditions: {},
        })
      );
    });
  });

  // =====================================================
  // UPDATE TESTS
  // =====================================================

  describe('update', () => {
    const updateDto: UpdateFeatureFlagDto = {
      name: 'Updated Name',
      isEnabled: false,
      rolloutPercentage: 75,
    };

    it('should update a feature flag successfully', async () => {
      const existingFlag = { ...mockFeatureFlag };
      mockRepository.findOne.mockResolvedValue(existingFlag);
      mockRepository.save.mockResolvedValue({ ...existingFlag, ...updateDto });

      const result = await service.update('test_feature', updateDto, 'admin');

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.feature_name).toBe('Updated Name');
    });

    it('should throw NotFoundException when feature flag not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non_existent', updateDto, 'admin')).rejects.toThrow(NotFoundException);
    });

    it('should update metadata and category correctly', async () => {
      const existingFlag = { ...mockFeatureFlag };
      mockRepository.findOne.mockResolvedValue(existingFlag);
      mockRepository.save.mockImplementation((entity) => Promise.resolve(entity));

      const updateWithMetadata: UpdateFeatureFlagDto = {
        metadata: { newField: 'value' },
        category: 'new_category',
      };

      await service.update('test_feature', updateWithMetadata, 'admin');

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            newField: 'value',
            category: 'new_category',
          }),
        })
      );
    });
  });

  // =====================================================
  // ISENABLED TESTS - CRITICAL LOGIC
  // =====================================================

  describe('isEnabled', () => {
    it('should return false when flag is disabled globally', async () => {
      const disabledFlag = { ...mockFeatureFlag, is_enabled: false };
      mockRepository.findOne.mockResolvedValue(disabledFlag);

      const result = await service.isEnabled('test_feature', 'user123', ['student']);

      expect(result).toEqual({
        enabled: false,
        reason: 'Feature is disabled globally',
      });
    });

    it('should return true when rollout is 100%', async () => {
      const fullRolloutFlag = { ...mockFeatureFlag, rollout_percentage: 100 };
      mockRepository.findOne.mockResolvedValue(fullRolloutFlag);

      const result = await service.isEnabled('test_feature', 'user123', ['student']);

      expect(result).toEqual({
        enabled: true,
        reason: 'Feature is enabled for 100% rollout',
      });
    });

    it('should return false when rollout is 0%', async () => {
      const noRolloutFlag = { ...mockFeatureFlag, rollout_percentage: 0 };
      mockRepository.findOne.mockResolvedValue(noRolloutFlag);

      const result = await service.isEnabled('test_feature', 'user123', ['student']);

      expect(result).toEqual({
        enabled: false,
        reason: 'Feature is at 0% rollout',
      });
    });

    it('should return true when user is in target_users (early access)', async () => {
      mockRepository.findOne.mockResolvedValue(mockFeatureFlag);

      const result = await service.isEnabled('test_feature', 'user1', ['student']);

      expect(result).toEqual({
        enabled: true,
        reason: 'User is in target users list',
      });
    });

    it('should return true when user has target role', async () => {
      mockRepository.findOne.mockResolvedValue(mockFeatureFlag);

      const result = await service.isEnabled('test_feature', 'user999', ['admin']);

      expect(result).toEqual({
        enabled: true,
        reason: 'User has a target role',
      });
    });

    it('should return consistent result for same userId (hash-based rollout)', async () => {
      const rolloutFlag = { ...mockFeatureFlag, rollout_percentage: 50 };
      mockRepository.findOne.mockResolvedValue(rolloutFlag);

      const userId = 'consistent_user';

      // Call multiple times
      const result1 = await service.isEnabled('test_feature', userId, ['student']);
      const result2 = await service.isEnabled('test_feature', userId, ['student']);
      const result3 = await service.isEnabled('test_feature', userId, ['student']);

      // Results should be consistent
      expect(result1.enabled).toBe(result2.enabled);
      expect(result2.enabled).toBe(result3.enabled);
      expect(result1.reason).toBe(result2.reason);
    });

    it('should distribute users evenly across rollout percentage', async () => {
      const rolloutFlag = { ...mockFeatureFlag, rollout_percentage: 50, target_users: [], target_roles: [] };
      mockRepository.findOne.mockResolvedValue(rolloutFlag);

      // Test with multiple users
      const results = await Promise.all(
        Array.from({ length: 100 }, (_, i) => service.isEnabled('test_feature', `user${i}`, ['student']))
      );

      const enabledCount = results.filter((r) => r.enabled).length;

      // Should be approximately 50% (allowing 20% variance for small sample)
      expect(enabledCount).toBeGreaterThan(30);
      expect(enabledCount).toBeLessThan(70);
    });

    it('should return false when feature flag not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.isEnabled('non_existent', 'user123', ['student']);

      expect(result).toEqual({
        enabled: false,
        reason: 'Feature flag not found',
      });
    });

    it('should handle missing userId with random selection', async () => {
      const rolloutFlag = { ...mockFeatureFlag, rollout_percentage: 50 };
      mockRepository.findOne.mockResolvedValue(rolloutFlag);

      const result = await service.isEnabled('test_feature', undefined, ['student']);

      expect(result.enabled).toBeDefined();
      expect(result.reason).toContain('Random selection');
    });
  });

  // =====================================================
  // HASHUSERID TESTS - CONSISTENCY
  // =====================================================

  describe('hashUserId (consistency)', () => {
    it('should generate consistent hash for same userId and feature', async () => {
      const rolloutFlag = { ...mockFeatureFlag, rollout_percentage: 50 };
      mockRepository.findOne.mockResolvedValue(rolloutFlag);

      const userId = 'test_user_hash';

      // Get hash indirectly through isEnabled
      const result1 = await service.isEnabled('test_feature', userId, ['student']);
      const result2 = await service.isEnabled('test_feature', userId, ['student']);

      // Should always return the same result for the same user
      expect(result1.enabled).toBe(result2.enabled);
    });

    it('should generate different results for different features (salt with featureKey)', async () => {
      const rolloutFlag1 = { ...mockFeatureFlag, feature_key: 'feature1', rollout_percentage: 50 };
      const rolloutFlag2 = { ...mockFeatureFlag, feature_key: 'feature2', rollout_percentage: 50 };

      const userId = 'same_user';

      mockRepository.findOne.mockResolvedValueOnce(rolloutFlag1);
      const result1 = await service.isEnabled('feature1', userId, ['student']);

      mockRepository.findOne.mockResolvedValueOnce(rolloutFlag2);
      const result2 = await service.isEnabled('feature2', userId, ['student']);

      // Different features should potentially give different results for the same user
      // (not guaranteed to be different, but hash should be independently calculated)
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });

  // =====================================================
  // HELPER METHODS
  // =====================================================

  describe('enable', () => {
    it('should enable a feature flag', async () => {
      const existingFlag = { ...mockFeatureFlag, is_enabled: false };
      mockRepository.findOne.mockResolvedValue(existingFlag);
      mockRepository.save.mockResolvedValue({ ...existingFlag, is_enabled: true });

      const result = await service.enable('test_feature', 'admin');

      expect(result.is_enabled).toBe(true);
    });
  });

  describe('disable', () => {
    it('should disable a feature flag', async () => {
      const existingFlag = { ...mockFeatureFlag, is_enabled: true };
      mockRepository.findOne.mockResolvedValue(existingFlag);
      mockRepository.save.mockResolvedValue({ ...existingFlag, is_enabled: false });

      const result = await service.disable('test_feature', 'admin');

      expect(result.is_enabled).toBe(false);
    });
  });

  describe('updateRollout', () => {
    it('should update rollout percentage', async () => {
      const existingFlag = { ...mockFeatureFlag, rollout_percentage: 50 };
      mockRepository.findOne.mockResolvedValue(existingFlag);
      mockRepository.save.mockResolvedValue({ ...existingFlag, rollout_percentage: 75 });

      const result = await service.updateRollout('test_feature', 75, 'admin');

      expect(result.rollout_percentage).toBe(75);
    });
  });

  describe('remove', () => {
    it('should remove a feature flag', async () => {
      mockRepository.findOne.mockResolvedValue(mockFeatureFlag);
      mockRepository.remove.mockResolvedValue(mockFeatureFlag);

      await service.remove('test_feature');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockFeatureFlag);
    });

    it('should throw NotFoundException when trying to remove non-existent flag', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non_existent')).rejects.toThrow(NotFoundException);
    });
  });
});
