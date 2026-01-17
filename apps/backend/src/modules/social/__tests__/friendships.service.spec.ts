/**
 * FriendshipsService Unit Tests
 *
 * Tests for friendship management service.
 * Covers friend requests, acceptance/rejection, blocking, and queries.
 */

// Mock enums BEFORE any imports
jest.mock('@shared/constants/enums.constants', () => ({
  FriendshipStatusEnum: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    BLOCKED: 'blocked',
  },
  EnrollmentMethodEnum: {
    TEACHER_INVITE: 'teacher_invite',
    SELF_ENROLL: 'self_enroll',
    CODE: 'code',
  },
  ClassroomMemberStatusEnum: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    SUSPENDED: 'suspended',
    REMOVED: 'removed',
  },
  TeamChallengeStatusEnum: {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  TeamMemberRoleEnum: {
    LEADER: 'leader',
    MEMBER: 'member',
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { FriendshipsService } from '../services/friendships.service';
import { Friendship } from '../entities';

// Local enum reference for assertions
const FriendshipStatusEnum = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  BLOCKED: 'blocked',
};

describe('FriendshipsService', () => {
  let service: FriendshipsService;
  let friendshipRepo: jest.Mocked<Repository<Friendship>>;

  const mockFriendshipRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockFriendship: Partial<Friendship> = {
    id: 'friendship-123',
    user_id: 'user-1',
    friend_id: 'user-2',
    status: FriendshipStatusEnum.PENDING as any,
    created_at: new Date('2026-01-15'),
    updated_at: new Date('2026-01-15'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendshipsService,
        {
          provide: getRepositoryToken(Friendship, 'social'),
          useValue: mockFriendshipRepo,
        },
      ],
    }).compile();

    service = module.get<FriendshipsService>(FriendshipsService);
    friendshipRepo = module.get(getRepositoryToken(Friendship, 'social'));

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findByUserId', () => {
    it('should return all friendships for a user', async () => {
      // Arrange
      const friendships = [
        { ...mockFriendship },
        { ...mockFriendship, id: 'friendship-456', friend_id: 'user-3' },
      ];
      mockFriendshipRepo.find.mockResolvedValue(friendships as Friendship[]);

      // Act
      const result = await service.findByUserId('user-1');

      // Assert
      expect(result).toHaveLength(2);
      expect(mockFriendshipRepo.find).toHaveBeenCalledWith({
        where: [{ user_id: 'user-1' }, { friend_id: 'user-1' }],
        order: { updated_at: 'DESC' },
      });
    });

    it('should return empty array when no friendships exist', async () => {
      // Arrange
      mockFriendshipRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.findByUserId('user-no-friends');

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('findByUserPair', () => {
    it('should find friendship between two users', async () => {
      // Arrange
      mockFriendshipRepo.findOne.mockResolvedValue(mockFriendship as Friendship);

      // Act
      const result = await service.findByUserPair('user-1', 'user-2');

      // Assert
      expect(result).toEqual(mockFriendship);
      expect(mockFriendshipRepo.findOne).toHaveBeenCalledWith({
        where: [
          { user_id: 'user-1', friend_id: 'user-2' },
          { user_id: 'user-2', friend_id: 'user-1' },
        ],
      });
    });

    it('should return null when no friendship exists', async () => {
      // Arrange
      mockFriendshipRepo.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByUserPair('user-1', 'user-3');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('sendFriendRequest', () => {
    it('should create a pending friend request', async () => {
      // Arrange
      const newFriendship = {
        ...mockFriendship,
        status: FriendshipStatusEnum.PENDING,
      };
      mockFriendshipRepo.findOne.mockResolvedValue(null);
      mockFriendshipRepo.create.mockReturnValue(newFriendship as Friendship);
      mockFriendshipRepo.save.mockResolvedValue(newFriendship as Friendship);

      // Act
      const result = await service.sendFriendRequest('user-1', 'user-2');

      // Assert
      expect(result.status).toBe(FriendshipStatusEnum.PENDING);
      expect(mockFriendshipRepo.create).toHaveBeenCalledWith({
        user_id: 'user-1',
        friend_id: 'user-2',
        status: FriendshipStatusEnum.PENDING,
      });
    });

    it('should throw BadRequestException when sending request to self', async () => {
      // Act & Assert
      await expect(service.sendFriendRequest('user-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.sendFriendRequest('user-1', 'user-1')).rejects.toThrow(
        'Cannot send friend request to yourself',
      );
    });

    it('should throw ConflictException when friendship already exists', async () => {
      // Arrange
      mockFriendshipRepo.findOne.mockResolvedValue(mockFriendship as Friendship);

      // Act & Assert
      await expect(service.sendFriendRequest('user-1', 'user-2')).rejects.toThrow(
        ConflictException,
      );
      await expect(service.sendFriendRequest('user-1', 'user-2')).rejects.toThrow(
        'Friendship request already exists',
      );
    });
  });

  describe('acceptFriendRequest', () => {
    it('should accept a pending friend request', async () => {
      // Arrange
      const pendingFriendship = {
        ...mockFriendship,
        status: FriendshipStatusEnum.PENDING,
      };
      const acceptedFriendship = {
        ...pendingFriendship,
        status: FriendshipStatusEnum.ACCEPTED,
      };
      mockFriendshipRepo.findOne.mockResolvedValue(pendingFriendship as Friendship);
      mockFriendshipRepo.save.mockResolvedValue(acceptedFriendship as Friendship);

      // Act
      const result = await service.acceptFriendRequest('friendship-123');

      // Assert
      expect(result.status).toBe(FriendshipStatusEnum.ACCEPTED);
    });

    it('should throw NotFoundException when friendship not found', async () => {
      // Arrange
      mockFriendshipRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.acceptFriendRequest('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when friendship is not pending', async () => {
      // Arrange
      const acceptedFriendship = {
        ...mockFriendship,
        status: FriendshipStatusEnum.ACCEPTED,
      };
      mockFriendshipRepo.findOne.mockResolvedValue(acceptedFriendship as Friendship);

      // Act & Assert
      await expect(service.acceptFriendRequest('friendship-123')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.acceptFriendRequest('friendship-123')).rejects.toThrow(
        'Only pending friendship requests can be accepted',
      );
    });
  });

  describe('rejectFriendRequest', () => {
    it('should reject a pending friend request', async () => {
      // Arrange
      const pendingFriendship = {
        ...mockFriendship,
        status: FriendshipStatusEnum.PENDING,
      };
      const rejectedFriendship = {
        ...pendingFriendship,
        status: FriendshipStatusEnum.REJECTED,
      };
      mockFriendshipRepo.findOne.mockResolvedValue(pendingFriendship as Friendship);
      mockFriendshipRepo.save.mockResolvedValue(rejectedFriendship as Friendship);

      // Act
      const result = await service.rejectFriendRequest('friendship-123');

      // Assert
      expect(result.status).toBe(FriendshipStatusEnum.REJECTED);
    });

    it('should throw NotFoundException when friendship not found', async () => {
      // Arrange
      mockFriendshipRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.rejectFriendRequest('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when friendship is not pending', async () => {
      // Arrange
      const acceptedFriendship = {
        ...mockFriendship,
        status: FriendshipStatusEnum.ACCEPTED,
      };
      mockFriendshipRepo.findOne.mockResolvedValue(acceptedFriendship as Friendship);

      // Act & Assert
      await expect(service.rejectFriendRequest('friendship-123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('blockUser', () => {
    it('should block a user when no existing relationship', async () => {
      // Arrange
      const blockedFriendship = {
        ...mockFriendship,
        status: FriendshipStatusEnum.BLOCKED,
      };
      mockFriendshipRepo.findOne.mockResolvedValue(null);
      mockFriendshipRepo.create.mockReturnValue(blockedFriendship as Friendship);
      mockFriendshipRepo.save.mockResolvedValue(blockedFriendship as Friendship);

      // Act
      const result = await service.blockUser('user-1', 'user-2');

      // Assert
      expect(result.status).toBe(FriendshipStatusEnum.BLOCKED);
    });

    it('should update existing relationship to blocked', async () => {
      // Arrange
      const existingFriendship = {
        ...mockFriendship,
        status: FriendshipStatusEnum.ACCEPTED,
      };
      const blockedFriendship = {
        ...existingFriendship,
        status: FriendshipStatusEnum.BLOCKED,
      };
      mockFriendshipRepo.findOne.mockResolvedValue(existingFriendship as Friendship);
      mockFriendshipRepo.save.mockResolvedValue(blockedFriendship as Friendship);

      // Act
      const result = await service.blockUser('user-1', 'user-2');

      // Assert
      expect(result.status).toBe(FriendshipStatusEnum.BLOCKED);
    });

    it('should throw BadRequestException when blocking self', async () => {
      // Act & Assert
      await expect(service.blockUser('user-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.blockUser('user-1', 'user-1')).rejects.toThrow(
        'Cannot block yourself',
      );
    });
  });

  describe('unblockUser', () => {
    it('should remove blocked relationship', async () => {
      // Arrange
      const blockedFriendship = {
        ...mockFriendship,
        status: FriendshipStatusEnum.BLOCKED,
      };
      mockFriendshipRepo.findOne.mockResolvedValue(blockedFriendship as Friendship);
      mockFriendshipRepo.remove.mockResolvedValue(blockedFriendship as Friendship);

      // Act
      await service.unblockUser('user-1', 'user-2');

      // Assert
      expect(mockFriendshipRepo.remove).toHaveBeenCalledWith(blockedFriendship);
    });

    it('should throw NotFoundException when no blocked relationship exists', async () => {
      // Arrange
      mockFriendshipRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.unblockUser('user-1', 'user-2')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.unblockUser('user-1', 'user-2')).rejects.toThrow(
        'No blocked relationship found',
      );
    });
  });

  describe('removeFriend', () => {
    it('should remove an existing friendship', async () => {
      // Arrange
      mockFriendshipRepo.findOne.mockResolvedValue(mockFriendship as Friendship);
      mockFriendshipRepo.remove.mockResolvedValue(mockFriendship as Friendship);

      // Act
      await service.removeFriend('user-1', 'user-2');

      // Assert
      expect(mockFriendshipRepo.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException when friendship not found', async () => {
      // Arrange
      mockFriendshipRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.removeFriend('user-1', 'user-3')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.removeFriend('user-1', 'user-3')).rejects.toThrow(
        'Friendship not found',
      );
    });
  });

  describe('getPendingRequests', () => {
    it('should return pending requests received by user', async () => {
      // Arrange
      const pendingRequests = [
        { ...mockFriendship, status: FriendshipStatusEnum.PENDING },
        { ...mockFriendship, id: 'friendship-456', user_id: 'user-3', status: FriendshipStatusEnum.PENDING },
      ];
      mockFriendshipRepo.find.mockResolvedValue(pendingRequests as Friendship[]);

      // Act
      const result = await service.getPendingRequests('user-2');

      // Assert
      expect(result).toHaveLength(2);
      expect(mockFriendshipRepo.find).toHaveBeenCalledWith({
        where: {
          friend_id: 'user-2',
          status: FriendshipStatusEnum.PENDING,
        },
        order: { created_at: 'DESC' },
      });
    });

    it('should return empty array when no pending requests', async () => {
      // Arrange
      mockFriendshipRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.getPendingRequests('user-no-requests');

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('getSentRequests', () => {
    it('should return pending requests sent by user', async () => {
      // Arrange
      const sentRequests = [
        { ...mockFriendship, status: FriendshipStatusEnum.PENDING },
      ];
      mockFriendshipRepo.find.mockResolvedValue(sentRequests as Friendship[]);

      // Act
      const result = await service.getSentRequests('user-1');

      // Assert
      expect(result).toHaveLength(1);
      expect(mockFriendshipRepo.find).toHaveBeenCalledWith({
        where: {
          user_id: 'user-1',
          status: FriendshipStatusEnum.PENDING,
        },
        order: { created_at: 'DESC' },
      });
    });

    it('should return empty array when no sent requests', async () => {
      // Arrange
      mockFriendshipRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.getSentRequests('user-no-sent');

      // Assert
      expect(result).toHaveLength(0);
    });
  });
});
