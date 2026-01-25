import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { GamificationConfigService } from '../services/gamification-config.service';
import { SystemSetting } from '../entities/system-setting.entity';
import {
  ListParametersQueryDto,
  UpdateParameterDto,
  UpdateMayaRankDto,
} from '../dto/gamification-config';

/**
 * Unit tests for US-AE-005: Parameter-based Gamification Config Endpoints
 *
 * Tests new methods:
 * - listParameters
 * - getParameterById
 * - updateParameterById
 * - getMayaRanks
 * - updateMayaRank
 */
describe('GamificationConfigService - US-AE-005', () => {
  let service: GamificationConfigService;
  let _systemSettingRepository: Repository<SystemSetting>;

  const mockSystemSettingRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    query: jest.fn(),
  };

  // Mock parameter data
  const mockParameter: Partial<SystemSetting> = {
    id: 'param-uuid-1',
    setting_key: 'gamification.xp.base_per_exercise',
    setting_category: 'gamification',
    setting_subcategory: 'xp',
    setting_value: '10',
    value_type: 'number',
    default_value: '10',
    display_name: 'Base XP per Exercise',
    description: 'Base XP awarded for completing an exercise',
    is_public: false,
    is_readonly: false,
    is_system: false,
    min_value: 1,
    max_value: 1000,
    allowed_values: undefined,
    validation_rules: {},
    metadata: {},
    created_at: new Date('2025-11-01T00:00:00.000Z'),
    updated_at: new Date('2025-11-23T10:00:00.000Z'),
    created_by: 'system',
    updated_by: 'admin-1',
  };

  const mockCoinsParameter: Partial<SystemSetting> = {
    id: 'param-uuid-2',
    setting_key: 'gamification.coins.welcome_bonus',
    setting_category: 'gamification',
    setting_subcategory: 'coins',
    setting_value: '500',
    value_type: 'number',
    default_value: '500',
    display_name: 'Welcome Bonus',
    description: 'ML Coins awarded to new users',
    is_public: false,
    is_readonly: false,
    is_system: false,
    min_value: 0,
    max_value: 10000,
    created_at: new Date('2025-11-01T00:00:00.000Z'),
    updated_at: new Date('2025-11-23T10:00:00.000Z'),
  };

  const mockRanksSetting: Partial<SystemSetting> = {
    id: 'ranks-uuid-1',
    setting_key: 'gamification.ranks.thresholds',
    setting_category: 'gamification',
    setting_subcategory: 'ranks',
    setting_value: JSON.stringify({
      novice: 0,
      beginner: 100,
      intermediate: 500,
      advanced: 1500,
      expert: 5000,
    }),
    value_type: 'json',
    default_value: JSON.stringify({
      novice: 0,
      beginner: 100,
      intermediate: 500,
      advanced: 1500,
      expert: 5000,
    }),
    is_public: false,
    is_readonly: false,
    is_system: false,
    created_at: new Date('2025-11-01T00:00:00.000Z'),
    updated_at: new Date('2025-11-23T10:00:00.000Z'),
    updated_by: 'admin-1',
  };

  // Mock data for query() result - matches the raw SQL query format
  const mockRanksQueryResult = [
    { id: 'rank-1', name: 'Novato', level: 0, minXp: '0', maxXp: '99', multiplierXp: '1.0', multiplierMlCoins: '1.0', bonusMlCoins: '0', color: '#6B7280', icon: '/assets/ranks/novice.png', description: 'Rank inicial', perks: '[]', isActive: true, order: 0 },
    { id: 'rank-2', name: 'Guerrero', level: 1, minXp: '100', maxXp: '499', multiplierXp: '1.0', multiplierMlCoins: '1.0', bonusMlCoins: '100', color: '#10B981', icon: '/assets/ranks/beginner.png', description: 'Segundo rank', perks: '[]', isActive: true, order: 1 },
    { id: 'rank-3', name: 'Sabio', level: 2, minXp: '500', maxXp: '1499', multiplierXp: '1.2', multiplierMlCoins: '1.1', bonusMlCoins: '200', color: '#3B82F6', icon: '/assets/ranks/intermediate.png', description: 'Tercer rank', perks: '[]', isActive: true, order: 2 },
    { id: 'rank-4', name: 'Líder', level: 3, minXp: '1500', maxXp: '4999', multiplierXp: '1.5', multiplierMlCoins: '1.3', bonusMlCoins: '500', color: '#8B5CF6', icon: '/assets/ranks/advanced.png', description: 'Cuarto rank', perks: '[]', isActive: true, order: 3 },
    { id: 'rank-5', name: 'Maestro', level: 4, minXp: '5000', maxXp: null, multiplierXp: '2.0', multiplierMlCoins: '1.5', bonusMlCoins: '1000', color: '#F59E0B', icon: '/assets/ranks/expert.png', description: 'Rank máximo', perks: '[]', isActive: true, order: 4 },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationConfigService,
        {
          provide: getRepositoryToken(SystemSetting, 'auth'),
          useValue: mockSystemSettingRepository,
        },
      ],
    }).compile();

    service = module.get<GamificationConfigService>(
      GamificationConfigService,
    );
    systemSettingRepository = module.get(
      getRepositoryToken(SystemSetting, 'auth'),
    );

    jest.clearAllMocks();
  });

  describe('listParameters', () => {
    it('should list all parameters when no filter provided', async () => {
      // Arrange
      const query: ListParametersQueryDto = {};
      mockSystemSettingRepository.count.mockResolvedValue(2);
      mockSystemSettingRepository.find.mockResolvedValue([
        mockParameter,
        mockCoinsParameter,
      ] as SystemSetting[]);

      // Act
      const result = await service.listParameters(query);

      // Assert
      expect(result.parameters).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.filtered_by_category).toBeUndefined();
      expect(mockSystemSettingRepository.find).toHaveBeenCalledWith({
        where: { setting_category: 'gamification' },
      });
    });

    it('should filter parameters by category', async () => {
      // Arrange
      const query: ListParametersQueryDto = { category: 'xp' };
      mockSystemSettingRepository.count.mockResolvedValue(1);
      mockSystemSettingRepository.find.mockResolvedValue([
        mockParameter,
      ] as SystemSetting[]);

      // Act
      const result = await service.listParameters(query);

      // Assert
      expect(result.parameters).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.filtered_by_category).toBe('xp');
      expect(result.parameters[0].setting_key).toBe(
        'gamification.xp.base_per_exercise',
      );
      expect(mockSystemSettingRepository.find).toHaveBeenCalledWith({
        where: { setting_category: 'gamification', setting_subcategory: 'xp' },
      });
    });

    it('should map parameters to ParameterResponseDto format', async () => {
      // Arrange
      const query: ListParametersQueryDto = {};
      mockSystemSettingRepository.count.mockResolvedValue(1);
      mockSystemSettingRepository.find.mockResolvedValue([
        mockParameter,
      ] as SystemSetting[]);

      // Act
      const result = await service.listParameters(query);

      // Assert
      const param = result.parameters[0];
      expect(param).toHaveProperty('id', 'param-uuid-1');
      expect(param).toHaveProperty('setting_key');
      expect(param).toHaveProperty('setting_value');
      expect(param).toHaveProperty('value_type');
      expect(param).toHaveProperty('min_value');
      expect(param).toHaveProperty('max_value');
      expect(param).toHaveProperty('is_readonly');
      expect(param).toHaveProperty('is_system');
      expect(param.created_at).toBe('2025-11-01T00:00:00.000Z');
      expect(param.updated_at).toBe('2025-11-23T10:00:00.000Z');
    });
  });

  describe('getParameterById', () => {
    it('should return parameter details by ID', async () => {
      // Arrange
      mockSystemSettingRepository.findOne.mockResolvedValue(
        mockParameter as SystemSetting,
      );

      // Act
      const result = await service.getParameterById('param-uuid-1');

      // Assert
      expect(result.id).toBe('param-uuid-1');
      expect(result.setting_key).toBe('gamification.xp.base_per_exercise');
      expect(result.setting_value).toBe('10');
      expect(result.min_value).toBe(1);
      expect(result.max_value).toBe(1000);
      expect(mockSystemSettingRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'param-uuid-1', setting_category: 'gamification' },
      });
    });

    it('should throw NotFoundException if parameter does not exist', async () => {
      // Arrange
      mockSystemSettingRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getParameterById('invalid-uuid'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.getParameterById('invalid-uuid'),
      ).rejects.toThrow('Parameter with ID invalid-uuid not found');
    });
  });

  describe('updateParameterById', () => {
    it('should update parameter value successfully', async () => {
      // Arrange
      const dto: UpdateParameterDto = { value: '15' };
      const updatedParam = { ...mockParameter };
      mockSystemSettingRepository.findOne.mockResolvedValue(
        mockParameter as SystemSetting,
      );
      mockSystemSettingRepository.save.mockResolvedValue(updatedParam);

      // Act
      const result = await service.updateParameterById(
        'param-uuid-1',
        dto,
        'admin-2',
      );

      // Assert
      expect(result.message).toBe('Parameter updated successfully');
      expect(result.parameter.id).toBe('param-uuid-1');
      expect(result.parameter.old_value).toBe('10');
      expect(result.parameter.new_value).toBe('15');
      expect(result.parameter.updated_by).toBe('admin-2');
      expect(mockSystemSettingRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if parameter does not exist', async () => {
      // Arrange
      const dto: UpdateParameterDto = { value: '15' };
      mockSystemSettingRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateParameterById('invalid-uuid', dto, 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if parameter is readonly', async () => {
      // Arrange
      const dto: UpdateParameterDto = { value: '15' };
      const readonlyParam = { ...mockParameter, is_readonly: true };
      mockSystemSettingRepository.findOne.mockResolvedValue(
        readonlyParam as SystemSetting,
      );

      // Act & Assert
      await expect(
        service.updateParameterById('param-uuid-1', dto, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateParameterById('param-uuid-1', dto, 'admin-1'),
      ).rejects.toThrow('readonly');
    });

    it('should throw BadRequestException if parameter is system', async () => {
      // Arrange
      const dto: UpdateParameterDto = { value: '15' };
      const systemParam = { ...mockParameter, is_system: true };
      mockSystemSettingRepository.findOne.mockResolvedValue(
        systemParam as SystemSetting,
      );

      // Act & Assert
      await expect(
        service.updateParameterById('param-uuid-1', dto, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateParameterById('param-uuid-1', dto, 'admin-1'),
      ).rejects.toThrow('system');
    });

    it('should validate numeric value is within min/max range', async () => {
      // Arrange - value below minimum
      const dto1: UpdateParameterDto = { value: '0' };
      mockSystemSettingRepository.findOne.mockResolvedValue(
        mockParameter as SystemSetting,
      );

      // Act & Assert
      await expect(
        service.updateParameterById('param-uuid-1', dto1, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateParameterById('param-uuid-1', dto1, 'admin-1'),
      ).rejects.toThrow('below minimum');

      // Arrange - value above maximum
      const dto2: UpdateParameterDto = { value: '2000' };

      // Act & Assert
      await expect(
        service.updateParameterById('param-uuid-1', dto2, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateParameterById('param-uuid-1', dto2, 'admin-1'),
      ).rejects.toThrow('exceeds maximum');
    });

    it('should validate numeric value is actually a number', async () => {
      // Arrange
      const dto: UpdateParameterDto = { value: 'not-a-number' };
      mockSystemSettingRepository.findOne.mockResolvedValue(
        mockParameter as SystemSetting,
      );

      // Act & Assert
      await expect(
        service.updateParameterById('param-uuid-1', dto, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateParameterById('param-uuid-1', dto, 'admin-1'),
      ).rejects.toThrow('Expected a number');
    });

    it('should validate boolean values', async () => {
      // Arrange
      const boolParam = {
        ...mockParameter,
        value_type: 'boolean' as const,
      };
      const dto: UpdateParameterDto = { value: 'invalid' };
      mockSystemSettingRepository.findOne.mockResolvedValue(
        boolParam as SystemSetting,
      );

      // Act & Assert
      await expect(
        service.updateParameterById('param-uuid-1', dto, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateParameterById('param-uuid-1', dto, 'admin-1'),
      ).rejects.toThrow('Expected "true" or "false"');
    });

    it('should validate JSON values', async () => {
      // Arrange
      const jsonParam = {
        ...mockParameter,
        value_type: 'json' as const,
      };
      const dto: UpdateParameterDto = { value: '{invalid json' };
      mockSystemSettingRepository.findOne.mockResolvedValue(
        jsonParam as SystemSetting,
      );

      // Act & Assert
      await expect(
        service.updateParameterById('param-uuid-1', dto, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateParameterById('param-uuid-1', dto, 'admin-1'),
      ).rejects.toThrow('Invalid JSON');
    });
  });

  describe('getMayaRanks', () => {
    it('should return Maya ranks configuration', async () => {
      // Arrange - Service now uses query() to fetch from maya_ranks table
      mockSystemSettingRepository.query.mockResolvedValue(mockRanksQueryResult);
      mockSystemSettingRepository.findOne.mockResolvedValue(
        mockRanksSetting as SystemSetting,
      );

      // Act
      const result = await service.getMayaRanks();

      // Assert
      expect(result.ranks).toHaveLength(5);
      expect(result.total).toBe(5);
      expect(result.setting_key).toBe('gamification.ranks.thresholds');
      expect(result.setting_id).toBe('ranks-uuid-1');
      expect(result.updated_by).toBe('admin-1');
    });

    it('should calculate correct rank ranges', async () => {
      // Arrange
      mockSystemSettingRepository.query.mockResolvedValue(mockRanksQueryResult);
      mockSystemSettingRepository.findOne.mockResolvedValue(
        mockRanksSetting as SystemSetting,
      );

      // Act
      const result = await service.getMayaRanks();

      // Assert - New format from maya_ranks table
      const ranks = result.ranks;
      expect(ranks[0].name).toBe('Novato');
      expect(ranks[0].minXp).toBe(0);
      expect(ranks[0].maxXp).toBe(99);
      expect(ranks[0].order).toBe(0);
      expect(ranks[1].name).toBe('Guerrero');
      expect(ranks[1].minXp).toBe(100);
      expect(ranks[4].name).toBe('Maestro');
      expect(ranks[4].minXp).toBe(5000);
      expect(ranks[4].maxXp).toBeNull(); // Highest rank has no upper limit
    });

    it('should return empty ranks when no active ranks exist', async () => {
      // Arrange - Empty query result
      mockSystemSettingRepository.query.mockResolvedValue([]);
      mockSystemSettingRepository.findOne.mockResolvedValue(
        mockRanksSetting as SystemSetting,
      );

      // Act
      const result = await service.getMayaRanks();

      // Assert
      expect(result.ranks).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle database query errors gracefully', async () => {
      // Arrange - Query throws an error
      mockSystemSettingRepository.query.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Act & Assert - Should catch and re-throw as BadRequestException
      await expect(service.getMayaRanks()).rejects.toThrow();
    });
  });

  describe('updateMayaRank', () => {
    it('should update rank threshold successfully', async () => {
      // Arrange
      const dto: UpdateMayaRankDto = { min_xp: 150 };
      mockSystemSettingRepository.count.mockResolvedValue(1);
      mockSystemSettingRepository.findOne.mockResolvedValue(
        mockRanksSetting as SystemSetting,
      );
      mockSystemSettingRepository.save.mockImplementation(async (entity) => entity);

      // Act
      const result = await service.updateMayaRank('beginner', dto, 'admin-2');

      // Assert
      expect(result.message).toBe('Maya rank threshold updated successfully');
      expect(result.rank.rank_name).toBe('beginner');
      expect(result.rank.old_threshold).toBe(100);
      expect(result.rank.new_threshold).toBe(150);
      expect(result.all_ranks).toHaveLength(5);
      expect(result.all_ranks[1].min_xp).toBe(150);
      expect(mockSystemSettingRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid rank name', async () => {
      // Arrange
      const dto: UpdateMayaRankDto = { min_xp: 150 };

      // Act & Assert
      await expect(
        service.updateMayaRank('invalid-rank', dto, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateMayaRank('invalid-rank', dto, 'admin-1'),
      ).rejects.toThrow('Invalid rank name');
    });

    it('should throw NotFoundException if ranks setting does not exist', async () => {
      // Arrange
      const dto: UpdateMayaRankDto = { min_xp: 150 };
      mockSystemSettingRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateMayaRank('beginner', dto, 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if thresholds are not in ascending order', async () => {
      // Arrange - Setting beginner to 600 (higher than intermediate at 500)
      const dto: UpdateMayaRankDto = { min_xp: 600 };
      mockSystemSettingRepository.findOne.mockResolvedValue(
        mockRanksSetting as SystemSetting,
      );

      // Act & Assert
      await expect(
        service.updateMayaRank('beginner', dto, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateMayaRank('beginner', dto, 'admin-1'),
      ).rejects.toThrow('ascending order');
    });

    it('should throw BadRequestException if ranks setting is readonly', async () => {
      // Arrange
      const dto: UpdateMayaRankDto = { min_xp: 150 };
      const readonlyRanks = { ...mockRanksSetting, is_readonly: true };
      mockSystemSettingRepository.findOne.mockResolvedValue(
        readonlyRanks as SystemSetting,
      );

      // Act & Assert
      await expect(
        service.updateMayaRank('beginner', dto, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateMayaRank('beginner', dto, 'admin-1'),
      ).rejects.toThrow('readonly');
    });

    it('should update all ranks with correct ranges after update', async () => {
      // Arrange
      const dto: UpdateMayaRankDto = { min_xp: 200 };
      mockSystemSettingRepository.findOne.mockResolvedValue(
        mockRanksSetting as SystemSetting,
      );
      mockSystemSettingRepository.save.mockImplementation(async (entity) => entity);

      // Act
      const result = await service.updateMayaRank('beginner', dto, 'admin-2');

      // Assert
      const ranks = result.all_ranks;
      expect(ranks[0].max_xp).toBe(199); // novice max updated to 199
      expect(ranks[1].min_xp).toBe(200); // beginner min updated to 200
      expect(ranks[1].max_xp).toBe(499); // beginner max still 499
    });
  });
});
