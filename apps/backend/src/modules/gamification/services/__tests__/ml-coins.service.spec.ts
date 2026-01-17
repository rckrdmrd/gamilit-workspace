/**
 * MLCoinsService Unit Tests
 *
 * @description Tests for ML Coins virtual economy service covering:
 * - Balance retrieval and validation
 * - Adding coins (earnings)
 * - Spending coins (purchases)
 * - Transaction history
 * - Balance auditing
 * - Daily reset logic
 *
 * Sprint 0 - P0-008: Increase coverage to 30%+
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MLCoinsService } from '../ml-coins.service';
import { UserStats, MLCoinsTransaction, MayaRankEntity } from '../../entities';
import { TransactionTypeEnum } from '@shared/constants/enums.constants';
import { createMockRepository, createMockQueryBuilder } from '@/__mocks__/repositories.mock';
import { TestDataFactory } from '@/__mocks__/services.mock';

describe('MLCoinsService', () => {
  let service: MLCoinsService;
  let userStatsRepo: ReturnType<typeof createMockRepository>;
  let transactionRepo: ReturnType<typeof createMockRepository>;
  let mayaRanksRepo: ReturnType<typeof createMockRepository>;

  // Test data
  const mockUserId = TestDataFactory.createUuid('user');
  const mockUserStats = {
    user_id: mockUserId,
    ml_coins: 100,
    ml_coins_earned_total: 500,
    ml_coins_spent_total: 400,
    ml_coins_earned_today: 50,
    last_ml_coins_reset: new Date(),
  };

  beforeEach(async () => {
    userStatsRepo = createMockRepository<UserStats>();
    transactionRepo = createMockRepository<MLCoinsTransaction>();
    mayaRanksRepo = createMockRepository<MayaRankEntity>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MLCoinsService,
        { provide: getRepositoryToken(UserStats, 'gamification'), useValue: userStatsRepo },
        { provide: getRepositoryToken(MLCoinsTransaction, 'gamification'), useValue: transactionRepo },
        { provide: getRepositoryToken(MayaRankEntity, 'gamification'), useValue: mayaRanksRepo },
      ],
    }).compile();

    service = module.get<MLCoinsService>(MLCoinsService);

    jest.clearAllMocks();
  });

  describe('Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  // =========================================================================
  // GET BALANCE TESTS
  // =========================================================================

  describe('getBalance', () => {
    it('should return current balance', async () => {
      // Arrange
      userStatsRepo.findOne.mockResolvedValue(mockUserStats as any);

      // Act
      const result = await service.getBalance(mockUserId);

      // Assert
      expect(result).toBe(100);
      expect(userStatsRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: mockUserId },
      });
    });

    it('should throw NotFoundException if user stats not found', async () => {
      // Arrange
      userStatsRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getBalance(mockUserId)).rejects.toThrow(NotFoundException);
      await expect(service.getBalance(mockUserId)).rejects.toThrow(
        `User stats not found for ${mockUserId}`,
      );
    });
  });

  // =========================================================================
  // GET COINS STATS TESTS
  // =========================================================================

  describe('getCoinsStats', () => {
    it('should return complete ML Coins statistics', async () => {
      // Arrange
      userStatsRepo.findOne.mockResolvedValue(mockUserStats as any);

      // Act
      const result = await service.getCoinsStats(mockUserId);

      // Assert
      expect(result).toEqual({
        current_balance: 100,
        total_earned: 500,
        total_spent: 400,
        earned_today: 50,
      });
    });

    it('should throw NotFoundException if user stats not found', async () => {
      // Arrange
      userStatsRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getCoinsStats(mockUserId)).rejects.toThrow(NotFoundException);
    });
  });

  // =========================================================================
  // ADD COINS TESTS
  // =========================================================================

  describe('addCoins', () => {
    const amount = 50;
    const transactionType = TransactionTypeEnum.MISSION_REWARD;

    beforeEach(() => {
      userStatsRepo.findOne.mockResolvedValue({ ...mockUserStats } as any);
      userStatsRepo.save.mockImplementation((data) => Promise.resolve(data as any));
      transactionRepo.create.mockImplementation((data) => data as any);
      transactionRepo.save.mockImplementation((data) => Promise.resolve(data as any));
    });

    it('should add coins successfully', async () => {
      // Act
      const result = await service.addCoins(mockUserId, amount, transactionType);

      // Assert
      expect(result.balance).toBe(150); // 100 + 50
      expect(result.transaction).toBeDefined();
      expect(userStatsRepo.save).toHaveBeenCalled();
      expect(transactionRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if amount is zero or negative', async () => {
      // Act & Assert
      await expect(service.addCoins(mockUserId, 0, transactionType)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.addCoins(mockUserId, -10, transactionType)).rejects.toThrow(
        'Amount must be greater than 0',
      );
    });

    it('should apply multiplier correctly', async () => {
      // Arrange
      const multiplier = 2.0;

      // Act
      const result = await service.addCoins(
        mockUserId,
        amount,
        transactionType,
        'Bonus mission',
        undefined,
        undefined,
        multiplier,
      );

      // Assert
      expect(result.balance).toBe(200); // 100 + (50 * 2)
    });

    it('should update total earned and earned today', async () => {
      // Act
      await service.addCoins(mockUserId, amount, transactionType);

      // Assert
      expect(userStatsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ml_coins_earned_total: 550, // 500 + 50
          ml_coins_earned_today: 100, // 50 + 50
        }),
      );
    });

    it('should create transaction record with correct data', async () => {
      // Arrange
      const description = 'Mission completed';
      const referenceId = 'mission-123';

      // Act
      await service.addCoins(
        mockUserId,
        amount,
        transactionType,
        description,
        referenceId,
        'mission',
      );

      // Assert
      expect(transactionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          amount: amount,
          transaction_type: transactionType,
          description,
          reference_id: referenceId,
          reference_type: 'mission',
        }),
      );
    });

    it('should reset daily coins if 24 hours passed', async () => {
      // Arrange
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 2); // 2 days ago
      const statsWithOldReset = {
        ...mockUserStats,
        last_ml_coins_reset: oldDate,
        ml_coins_earned_today: 200,
      };
      userStatsRepo.findOne.mockResolvedValue(statsWithOldReset as any);

      // Act
      await service.addCoins(mockUserId, amount, transactionType);

      // Assert
      expect(userStatsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ml_coins_earned_today: amount, // Reset to new amount only
          last_ml_coins_reset: expect.any(Date),
        }),
      );
    });
  });

  // =========================================================================
  // SPEND COINS TESTS
  // =========================================================================

  describe('spendCoins', () => {
    const amount = 30;
    const transactionType = TransactionTypeEnum.SHOP_PURCHASE;

    beforeEach(() => {
      userStatsRepo.findOne.mockResolvedValue({ ...mockUserStats } as any);
      userStatsRepo.save.mockImplementation((data) => Promise.resolve(data as any));
      transactionRepo.create.mockImplementation((data) => data as any);
      transactionRepo.save.mockImplementation((data) => Promise.resolve(data as any));
    });

    it('should spend coins successfully', async () => {
      // Act
      const result = await service.spendCoins(mockUserId, amount, transactionType);

      // Assert
      expect(result.balance).toBe(70); // 100 - 30
      expect(userStatsRepo.save).toHaveBeenCalled();
      expect(transactionRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if amount is zero or negative', async () => {
      // Act & Assert
      await expect(service.spendCoins(mockUserId, 0, transactionType)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if insufficient balance', async () => {
      // Arrange
      const largeAmount = 200;

      // Act & Assert
      await expect(service.spendCoins(mockUserId, largeAmount, transactionType)).rejects.toThrow(
        'Insufficient balance',
      );
      await expect(
        service.spendCoins(mockUserId, largeAmount, transactionType),
      ).rejects.toThrow(`Required: ${largeAmount}, Available: 100`);
    });

    it('should update total spent correctly', async () => {
      // Act
      await service.spendCoins(mockUserId, amount, transactionType);

      // Assert
      expect(userStatsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ml_coins_spent_total: 430, // 400 + 30
        }),
      );
    });

    it('should create transaction with negative amount', async () => {
      // Act
      await service.spendCoins(mockUserId, amount, transactionType);

      // Assert
      expect(transactionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: -amount, // Negative for spending
        }),
      );
    });
  });

  // =========================================================================
  // GET TRANSACTIONS TESTS
  // =========================================================================

  describe('getTransactions', () => {
    const mockTransactions = [
      {
        id: 'tx-1',
        user_id: mockUserId,
        amount: 50,
        transaction_type: TransactionTypeEnum.MISSION_REWARD,
        created_at: new Date(),
      },
      {
        id: 'tx-2',
        user_id: mockUserId,
        amount: -20,
        transaction_type: TransactionTypeEnum.SHOP_PURCHASE,
        created_at: new Date(),
      },
    ];

    it('should return transaction history', async () => {
      // Arrange
      transactionRepo.find.mockResolvedValue(mockTransactions as any);

      // Act
      const result = await service.getTransactions(mockUserId);

      // Assert
      expect(result).toEqual(mockTransactions);
      expect(transactionRepo.find).toHaveBeenCalledWith({
        where: { user_id: mockUserId },
        order: { created_at: 'DESC' },
        take: 50,
        skip: 0,
      });
    });

    it('should support pagination', async () => {
      // Arrange
      const limit = 10;
      const offset = 5;
      transactionRepo.find.mockResolvedValue(mockTransactions as any);

      // Act
      await service.getTransactions(mockUserId, limit, offset);

      // Assert
      expect(transactionRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: limit,
          skip: offset,
        }),
      );
    });
  });

  // =========================================================================
  // GET TRANSACTIONS BY TYPE TESTS
  // =========================================================================

  describe('getTransactionsByType', () => {
    it('should return transactions filtered by type', async () => {
      // Arrange
      const transactionType = TransactionTypeEnum.MISSION_REWARD;
      transactionRepo.find.mockResolvedValue([]);

      // Act
      await service.getTransactionsByType(mockUserId, transactionType);

      // Assert
      expect(transactionRepo.find).toHaveBeenCalledWith({
        where: {
          user_id: mockUserId,
          transaction_type: transactionType,
        },
        order: { created_at: 'DESC' },
        take: 50,
      });
    });
  });

  // =========================================================================
  // GET TRANSACTIONS BY DATE RANGE TESTS
  // =========================================================================

  describe('getTransactionsByDateRange', () => {
    it('should return transactions within date range', async () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getMany.mockResolvedValue([]);
      transactionRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      await service.getTransactionsByDateRange(mockUserId, startDate, endDate);

      // Assert
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('t.user_id = :userId', {
        userId: mockUserId,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('t.created_at >= :startDate', {
        startDate,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('t.created_at <= :endDate', {
        endDate,
      });
    });
  });

  // =========================================================================
  // AUDIT BALANCE TESTS
  // =========================================================================

  describe('auditBalance', () => {
    it('should return valid audit when balance matches', async () => {
      // Arrange
      userStatsRepo.findOne.mockResolvedValue(mockUserStats as any);
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawOne.mockResolvedValue({ total_amount: '0' }); // 0 + 100 initial = 100
      transactionRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.auditBalance(mockUserId);

      // Assert
      expect(result.is_valid).toBe(true);
      expect(result.difference).toBe(0);
      expect(result.actual_balance).toBe(100);
      expect(result.calculated_balance).toBe(100);
    });

    it('should return invalid audit when balance mismatch', async () => {
      // Arrange
      userStatsRepo.findOne.mockResolvedValue(mockUserStats as any);
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawOne.mockResolvedValue({ total_amount: '50' }); // Should be 150 total
      transactionRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.auditBalance(mockUserId);

      // Assert
      expect(result.is_valid).toBe(false);
      expect(result.difference).not.toBe(0);
    });

    it('should throw NotFoundException if user stats not found', async () => {
      // Arrange
      userStatsRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.auditBalance(mockUserId)).rejects.toThrow(NotFoundException);
    });
  });

  // =========================================================================
  // GET TOTAL EARNINGS IN PERIOD TESTS
  // =========================================================================

  describe('getTotalEarningsInPeriod', () => {
    it('should return total earnings in period', async () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawOne.mockResolvedValue({ total_earned: '250' });
      transactionRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getTotalEarningsInPeriod(mockUserId, startDate, endDate);

      // Assert
      expect(result).toBe(250);
    });

    it('should return 0 if no earnings found', async () => {
      // Arrange
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawOne.mockResolvedValue(null);
      transactionRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getTotalEarningsInPeriod(mockUserId, startDate, endDate);

      // Assert
      expect(result).toBe(0);
    });
  });

  // =========================================================================
  // GET DAILY SUMMARY TESTS
  // =========================================================================

  describe('getDailySummary', () => {
    it('should return daily transaction summary', async () => {
      // Arrange
      const date = new Date('2024-01-15');
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawOne.mockResolvedValue({
        transaction_count: '10',
        total_earned: '150',
        total_spent: '50',
      });
      transactionRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getDailySummary(mockUserId, date);

      // Assert
      expect(result).toEqual({
        date: '2024-01-15',
        total_earned: 150,
        total_spent: 50,
        net_change: 100,
        transaction_count: 10,
      });
    });

    it('should calculate net change correctly', async () => {
      // Arrange
      const date = new Date('2024-01-15');
      const mockQueryBuilder = createMockQueryBuilder();
      mockQueryBuilder.getRawOne.mockResolvedValue({
        transaction_count: '5',
        total_earned: '100',
        total_spent: '150',
      });
      transactionRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      // Act
      const result = await service.getDailySummary(mockUserId, date);

      // Assert
      expect(result.net_change).toBe(-50); // 100 - 150
    });
  });

  // =========================================================================
  // GET TOP EARNERS TESTS
  // =========================================================================

  describe('getTopEarners', () => {
    it('should return top earners leaderboard', async () => {
      // Arrange
      const topEarners = [
        { user_id: 'user-1', ml_coins_earned_total: 1000 },
        { user_id: 'user-2', ml_coins_earned_total: 800 },
      ];
      userStatsRepo.find.mockResolvedValue(topEarners as any);

      // Act
      const result = await service.getTopEarners(50);

      // Assert
      expect(result).toEqual(topEarners);
      expect(userStatsRepo.find).toHaveBeenCalledWith({
        order: { ml_coins_earned_total: 'DESC' },
        take: 50,
      });
    });
  });
});
