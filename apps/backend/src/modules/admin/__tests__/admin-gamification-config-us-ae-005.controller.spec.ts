import { Test, TestingModule } from '@nestjs/testing';
import { AdminGamificationConfigController } from '../controllers/admin-gamification-config.controller';
import { GamificationConfigService } from '../services/gamification-config.service';
import {
  ListParametersQueryDto,
  ParametersListResponseDto,
  ParameterResponseDto,
  UpdateParameterDto,
  UpdateParameterResponseDto,
  MayaRanksResponseDto,
  UpdateMayaRankDto,
  UpdateMayaRankResponseDto,
} from '../dto/gamification-config';

/**
 * Unit tests for AdminGamificationConfigController - US-AE-005 Endpoints
 *
 * Tests new endpoints:
 * - GET /parameters
 * - GET /parameters/:id
 * - PUT /parameters/:id
 * - GET /maya-ranks
 * - PUT /maya-ranks/:rankName
 */
describe('AdminGamificationConfigController - US-AE-005', () => {
  let controller: AdminGamificationConfigController;
  let service: GamificationConfigService;

  const mockGamificationConfigService = {
    listParameters: jest.fn(),
    getParameterById: jest.fn(),
    updateParameterById: jest.fn(),
    getMayaRanks: jest.fn(),
    updateMayaRank: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminGamificationConfigController],
      providers: [
        {
          provide: GamificationConfigService,
          useValue: mockGamificationConfigService,
        },
      ],
    }).compile();

    controller = module.get<AdminGamificationConfigController>(
      AdminGamificationConfigController,
    );
    service = module.get<GamificationConfigService>(
      GamificationConfigService,
    );

    jest.clearAllMocks();
  });

  describe('GET /parameters', () => {
    it('should return all parameters when no filter provided', async () => {
      // Arrange
      const query: ListParametersQueryDto = {};
      const expectedResult: ParametersListResponseDto = {
        parameters: [
          {
            id: 'param-1',
            setting_key: 'gamification.xp.base_per_exercise',
            setting_category: 'gamification',
            setting_subcategory: 'xp',
            setting_value: '10',
            value_type: 'number',
            default_value: '10',
            display_name: 'Base XP per Exercise',
            description: 'Base XP awarded for completing an exercise',
            help_text: undefined,
            is_public: false,
            is_readonly: false,
            is_system: false,
            min_value: 1,
            max_value: 1000,
            allowed_values: undefined,
            validation_rules: {},
            metadata: {},
            created_at: '2025-11-01T00:00:00.000Z',
            updated_at: '2025-11-23T10:00:00.000Z',
            created_by: 'system',
            updated_by: 'admin-1',
          },
        ],
        total: 1,
        filtered_by_category: undefined,
      };

      mockGamificationConfigService.listParameters.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result = await controller.listParameters(query);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(service.listParameters).toHaveBeenCalledWith(query);
      expect(service.listParameters).toHaveBeenCalledTimes(1);
    });

    it('should return filtered parameters by category', async () => {
      // Arrange
      const query: ListParametersQueryDto = { category: 'xp' };
      const expectedResult: ParametersListResponseDto = {
        parameters: [
          {
            id: 'param-1',
            setting_key: 'gamification.xp.base_per_exercise',
            setting_category: 'gamification',
            setting_subcategory: 'xp',
            setting_value: '10',
            value_type: 'number',
            default_value: '10',
            display_name: 'Base XP per Exercise',
            description: 'Base XP awarded',
            help_text: undefined,
            is_public: false,
            is_readonly: false,
            is_system: false,
            min_value: 1,
            max_value: 1000,
            allowed_values: undefined,
            validation_rules: {},
            metadata: {},
            created_at: '2025-11-01T00:00:00.000Z',
            updated_at: '2025-11-23T10:00:00.000Z',
            created_by: 'system',
            updated_by: 'admin-1',
          },
        ],
        total: 1,
        filtered_by_category: 'xp',
      };

      mockGamificationConfigService.listParameters.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result = await controller.listParameters(query);

      // Assert
      expect(result.filtered_by_category).toBe('xp');
      expect(result.total).toBe(1);
      expect(service.listParameters).toHaveBeenCalledWith(query);
    });
  });

  describe('GET /parameters/:id', () => {
    it('should return parameter details by ID', async () => {
      // Arrange
      const parameterId = 'param-uuid-1';
      const expectedResult: ParameterResponseDto = {
        id: parameterId,
        setting_key: 'gamification.xp.base_per_exercise',
        setting_category: 'gamification',
        setting_subcategory: 'xp',
        setting_value: '10',
        value_type: 'number',
        default_value: '10',
        display_name: 'Base XP per Exercise',
        description: 'Base XP awarded for completing an exercise',
        help_text: 'This affects all exercises',
        is_public: false,
        is_readonly: false,
        is_system: false,
        min_value: 1,
        max_value: 1000,
        allowed_values: undefined,
        validation_rules: {},
        metadata: {},
        created_at: '2025-11-01T00:00:00.000Z',
        updated_at: '2025-11-23T10:00:00.000Z',
        created_by: 'system',
        updated_by: 'admin-1',
      };

      mockGamificationConfigService.getParameterById.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result = await controller.getParameterById(parameterId);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(result.id).toBe(parameterId);
      expect(service.getParameterById).toHaveBeenCalledWith(parameterId);
      expect(service.getParameterById).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /parameters/:id', () => {
    it('should update parameter value successfully', async () => {
      // Arrange
      const parameterId = 'param-uuid-1';
      const dto: UpdateParameterDto = { value: '15' };
      const req = { user: { id: 'admin-2' } };
      const expectedResult: UpdateParameterResponseDto = {
        message: 'Parameter updated successfully',
        parameter: {
          id: parameterId,
          setting_key: 'gamification.xp.base_per_exercise',
          old_value: '10',
          new_value: '15',
          updated_at: '2025-11-23T10:35:00.000Z',
          updated_by: 'admin-2',
        },
      };

      mockGamificationConfigService.updateParameterById.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result = await controller.updateParameterById(
        parameterId,
        dto,
        req,
      );

      // Assert
      expect(result).toEqual(expectedResult);
      expect(result.parameter.new_value).toBe('15');
      expect(result.parameter.updated_by).toBe('admin-2');
      expect(service.updateParameterById).toHaveBeenCalledWith(
        parameterId,
        dto,
        'admin-2',
      );
      expect(service.updateParameterById).toHaveBeenCalledTimes(1);
    });

    it('should extract admin ID from request', async () => {
      // Arrange
      const parameterId = 'param-uuid-1';
      const dto: UpdateParameterDto = { value: '20' };
      const req = { user: { id: 'admin-uuid-123' } };
      const expectedResult: UpdateParameterResponseDto = {
        message: 'Parameter updated successfully',
        parameter: {
          id: parameterId,
          setting_key: 'gamification.xp.base_per_exercise',
          old_value: '15',
          new_value: '20',
          updated_at: '2025-11-23T10:40:00.000Z',
          updated_by: 'admin-uuid-123',
        },
      };

      mockGamificationConfigService.updateParameterById.mockResolvedValue(
        expectedResult,
      );

      // Act
      await controller.updateParameterById(parameterId, dto, req);

      // Assert
      expect(service.updateParameterById).toHaveBeenCalledWith(
        parameterId,
        dto,
        'admin-uuid-123',
      );
    });
  });

  describe('GET /maya-ranks', () => {
    it('should return Maya ranks configuration', async () => {
      // Arrange
      const expectedResult: MayaRanksResponseDto = {
        ranks: [
          {
            id: 'rank-uuid-1',
            name: 'Novato',
            level: 1,
            minXp: 0,
            maxXp: 99,
            multiplierXp: 1.0,
            multiplierMlCoins: 1.0,
            bonusMlCoins: 0,
            color: '#6B7280',
            icon: '/assets/ranks/novice.png',
            description: 'Rank inicial',
            perks: [],
            isActive: true,
            order: 1,
          },
          {
            id: 'rank-uuid-2',
            name: 'Guerrero',
            level: 2,
            minXp: 100,
            maxXp: 499,
            multiplierXp: 1.0,
            multiplierMlCoins: 1.0,
            bonusMlCoins: 100,
            color: '#6B7280',
            icon: '/assets/ranks/beginner.png',
            description: 'Segundo rank',
            perks: [],
            isActive: true,
            order: 2,
          },
          {
            id: 'rank-uuid-3',
            name: 'Sabio',
            level: 3,
            minXp: 500,
            maxXp: 1499,
            multiplierXp: 1.0,
            multiplierMlCoins: 1.0,
            bonusMlCoins: 200,
            color: '#6B7280',
            icon: '/assets/ranks/intermediate.png',
            description: 'Tercer rank',
            perks: [],
            isActive: true,
            order: 3,
          },
          {
            id: 'rank-uuid-4',
            name: 'Líder',
            level: 4,
            minXp: 1500,
            maxXp: 4999,
            multiplierXp: 1.0,
            multiplierMlCoins: 1.0,
            bonusMlCoins: 500,
            color: '#6B7280',
            icon: '/assets/ranks/advanced.png',
            description: 'Cuarto rank',
            perks: [],
            isActive: true,
            order: 4,
          },
          {
            id: 'rank-uuid-5',
            name: 'Maestro',
            level: 5,
            minXp: 5000,
            maxXp: null,
            multiplierXp: 1.0,
            multiplierMlCoins: 1.0,
            bonusMlCoins: 1000,
            color: '#6B7280',
            icon: '/assets/ranks/expert.png',
            description: 'Rank máximo',
            perks: [],
            isActive: true,
            order: 5,
          },
        ],
        total: 5,
        setting_key: 'gamification.ranks.thresholds',
        setting_id: 'ranks-uuid-1',
        last_updated: '2025-11-23T10:00:00.000Z',
        updated_by: 'admin-1',
      };

      mockGamificationConfigService.getMayaRanks.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result = await controller.getMayaRanks();

      // Assert
      expect(result).toEqual(expectedResult);
      expect(result.ranks).toHaveLength(5);
      expect(result.total).toBe(5);
      expect(result.ranks[0].name).toBe('Novato');
      expect(result.ranks[4].name).toBe('Maestro');
      expect(result.ranks[4].maxXp).toBeNull();
      expect(service.getMayaRanks).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /maya-ranks/:rankName', () => {
    it('should update Maya rank threshold successfully', async () => {
      // Arrange
      const rankName = 'beginner';
      const dto: UpdateMayaRankDto = { min_xp: 150 };
      const req = { user: { id: 'admin-2' } };
      const expectedResult: UpdateMayaRankResponseDto = {
        message: 'Maya rank threshold updated successfully',
        rank: {
          rank_name: 'beginner',
          old_threshold: 100,
          new_threshold: 150,
          updated_at: '2025-11-23T10:45:00.000Z',
        },
        all_ranks: [
          {
            rank_name: 'novice',
            min_xp: 0,
            max_xp: 149,
            rank_order: 0,
          },
          {
            rank_name: 'beginner',
            min_xp: 150,
            max_xp: 499,
            rank_order: 1,
          },
          {
            rank_name: 'intermediate',
            min_xp: 500,
            max_xp: 1499,
            rank_order: 2,
          },
          {
            rank_name: 'advanced',
            min_xp: 1500,
            max_xp: 4999,
            rank_order: 3,
          },
          {
            rank_name: 'expert',
            min_xp: 5000,
            max_xp: null,
            rank_order: 4,
          },
        ],
      };

      mockGamificationConfigService.updateMayaRank.mockResolvedValue(
        expectedResult,
      );

      // Act
      const result = await controller.updateMayaRank(rankName, dto, req);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(result.rank.rank_name).toBe('beginner');
      expect(result.rank.new_threshold).toBe(150);
      expect(result.all_ranks).toHaveLength(5);
      expect(result.all_ranks[0].max_xp).toBe(149); // Updated based on new beginner threshold
      expect(service.updateMayaRank).toHaveBeenCalledWith(
        rankName,
        dto,
        'admin-2',
      );
      expect(service.updateMayaRank).toHaveBeenCalledTimes(1);
    });

    it('should extract admin ID from request', async () => {
      // Arrange
      const rankName = 'intermediate';
      const dto: UpdateMayaRankDto = { min_xp: 600 };
      const req = { user: { id: 'admin-xyz-789' } };
      const expectedResult: UpdateMayaRankResponseDto = {
        message: 'Maya rank threshold updated successfully',
        rank: {
          rank_name: 'intermediate',
          old_threshold: 500,
          new_threshold: 600,
          updated_at: '2025-11-23T10:50:00.000Z',
        },
        all_ranks: [],
      };

      mockGamificationConfigService.updateMayaRank.mockResolvedValue(
        expectedResult,
      );

      // Act
      await controller.updateMayaRank(rankName, dto, req);

      // Assert
      expect(service.updateMayaRank).toHaveBeenCalledWith(
        rankName,
        dto,
        'admin-xyz-789',
      );
    });

    it('should handle all valid rank names', async () => {
      // Arrange
      const validRanks = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'];
      const dto: UpdateMayaRankDto = { min_xp: 100 };
      const req = { user: { id: 'admin-1' } };

      mockGamificationConfigService.updateMayaRank.mockResolvedValue({
        message: 'Maya rank threshold updated successfully',
        rank: {
          rank_name: '',
          old_threshold: 0,
          new_threshold: 100,
          updated_at: '2025-11-23T10:50:00.000Z',
        },
        all_ranks: [],
      });

      // Act & Assert
      for (const rankName of validRanks) {
        await controller.updateMayaRank(rankName, dto, req);
        expect(service.updateMayaRank).toHaveBeenCalledWith(
          rankName,
          dto,
          'admin-1',
        );
      }

      expect(service.updateMayaRank).toHaveBeenCalledTimes(5);
    });
  });
});
