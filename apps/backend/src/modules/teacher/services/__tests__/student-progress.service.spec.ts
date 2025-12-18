/**
 * Student Progress Service - Unit Tests
 *
 * Tests for CORR-001: Validates that getStudentProgress correctly uses profile.id
 * instead of profile.user_id when querying submissions and progress tables.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { StudentProgressService } from '../student-progress.service';
import { ExerciseSubmission } from '@/modules/progress/entities/exercise-submission.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { ModuleProgress } from '@/modules/progress/entities/module-progress.entity';
import { ClassroomMember } from '@/modules/social/entities/classroom-member.entity';
import { Classroom } from '@/modules/social/entities/classroom.entity';
import { User } from '@/modules/auth/entities/user.entity';
import { UserStats } from '@/modules/gamification/entities/user-stats.entity';

describe('StudentProgressService - CORR-001 Fix', () => {
  let service: StudentProgressService;
  let submissionRepository: Repository<ExerciseSubmission>;
  let profileRepository: Repository<Profile>;
  let moduleProgressRepository: Repository<ModuleProgress>;
  let _classroomMemberRepository: Repository<ClassroomMember>;
  let _classroomRepository: Repository<Classroom>;
  let _userRepository: Repository<User>;
  let userStatsRepository: Repository<UserStats>;

  // Mock repositories
  const mockSubmissionRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockProfileRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockModuleProgressRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockClassroomMemberRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockClassroomRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findByIds: jest.fn(),
  };

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUserStatsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentProgressService,
        {
          provide: getRepositoryToken(ExerciseSubmission, 'progress'),
          useValue: mockSubmissionRepository,
        },
        {
          provide: getRepositoryToken(Profile, 'auth'),
          useValue: mockProfileRepository,
        },
        {
          provide: getRepositoryToken(ModuleProgress, 'progress'),
          useValue: mockModuleProgressRepository,
        },
        {
          provide: getRepositoryToken(ClassroomMember, 'social'),
          useValue: mockClassroomMemberRepository,
        },
        {
          provide: getRepositoryToken(Classroom, 'social'),
          useValue: mockClassroomRepository,
        },
        {
          provide: getRepositoryToken(User, 'auth'),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserStats, 'gamification'),
          useValue: mockUserStatsRepository,
        },
      ],
    }).compile();

    service = module.get<StudentProgressService>(StudentProgressService);
    submissionRepository = module.get(getRepositoryToken(ExerciseSubmission, 'progress'));
    profileRepository = module.get(getRepositoryToken(Profile, 'auth'));
    moduleProgressRepository = module.get(getRepositoryToken(ModuleProgress, 'progress'));
    classroomMemberRepository = module.get(getRepositoryToken(ClassroomMember, 'social'));
    classroomRepository = module.get(getRepositoryToken(Classroom, 'social'));
    userRepository = module.get(getRepositoryToken(User, 'auth'));
    userStatsRepository = module.get(getRepositoryToken(UserStats, 'gamification'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CORR-001: profile.id vs profile.user_id', () => {
    /**
     * CRITICAL TEST: Validates that getStudentStats uses profile.id (PK)
     * instead of profile.user_id (FK) when querying submissions.
     *
     * WHY THIS TEST?
     * - exercise_submissions.user_id is FK to profiles.id (NOT auth.users.id)
     * - Using profile.user_id would return 0 results ALWAYS
     * - This bug breaks Teacher Portal's ability to view student progress
     */
    it('should fetch submissions using profile.id, not profile.user_id', async () => {
      const mockProfile = {
        id: 'profile-uuid-123',       // This is the PRIMARY KEY
        user_id: 'user-uuid-456',     // This is FK to auth.users - DIFFERENT!
        email: 'student@test.com',
        full_name: 'Test Student',
        display_name: 'Test',
        avatar_url: null,
        created_at: new Date(),
        last_sign_in_at: new Date(),
      };

      const mockSubmissions = [
        {
          id: 'sub-1',
          user_id: 'profile-uuid-123', // MUST match profile.id
          exercise_id: 'ex-1',
          is_correct: true,
          score: 10,
          max_score: 10,
          time_spent_seconds: 120,
          hints_count: 0,
          submitted_at: new Date(),
        },
      ];

      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockProfile as any);
      jest.spyOn(submissionRepository, 'find').mockResolvedValue(mockSubmissions as any);
      jest.spyOn(moduleProgressRepository, 'find').mockResolvedValue([]);

      await service.getStudentStats('profile-uuid-123');

      // CRITICAL ASSERTION: Verify that submissions query uses profile.id
      expect(submissionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'profile-uuid-123' },  // profile.id ✅
        }),
      );

      // CRITICAL NEGATIVE ASSERTION: Ensure it does NOT use profile.user_id
      expect(submissionRepository.find).not.toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'user-uuid-456' },  // profile.user_id ❌
        }),
      );
    });

    /**
     * TEST: Validates that getStudentStats uses profile.id for module_progress query
     */
    it('should fetch module_progress using profile.id, not profile.user_id', async () => {
      const mockProfile = {
        id: 'profile-uuid-123',
        user_id: 'user-uuid-456',
        email: 'student@test.com',
        full_name: 'Test Student',
        created_at: new Date(),
      };

      const mockModuleProgress = [
        {
          id: 'mp-1',
          user_id: 'profile-uuid-123', // MUST match profile.id
          module_id: 'module-1',
          progress_percentage: 75,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockProfile as any);
      jest.spyOn(submissionRepository, 'find').mockResolvedValue([]);
      jest.spyOn(moduleProgressRepository, 'find').mockResolvedValue(mockModuleProgress as any);

      await service.getStudentStats('profile-uuid-123');

      // Verify module_progress query uses profile.id
      expect(moduleProgressRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'profile-uuid-123' },  // profile.id ✅
        }),
      );

      // Ensure it does NOT use profile.user_id
      expect(moduleProgressRepository.find).not.toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'user-uuid-456' },  // profile.user_id ❌
        }),
      );
    });

    /**
     * TEST: Validates that getModuleProgress uses profile.id
     */
    it('should fetch module progress data using profile.id', async () => {
      const mockProfile = {
        id: 'profile-uuid-789',
        user_id: 'user-uuid-999',
        email: 'student@test.com',
        created_at: new Date(),
      };

      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockProfile as any);
      jest.spyOn(moduleProgressRepository, 'find').mockResolvedValue([]);

      await service.getModuleProgress('profile-uuid-789');

      expect(moduleProgressRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'profile-uuid-789' },  // profile.id ✅
        }),
      );
    });

    /**
     * TEST: Validates that getExerciseHistory uses profile.id in whereConditions
     */
    it('should fetch exercise history using profile.id', async () => {
      const mockProfile = {
        id: 'profile-abc',
        user_id: 'user-xyz',
        email: 'student@test.com',
        created_at: new Date(),
      };

      const query = { time_range: 'all', status: 'all' };

      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockProfile as any);
      jest.spyOn(submissionRepository, 'find').mockResolvedValue([]);

      await service.getExerciseHistory('profile-abc', query as any);

      expect(submissionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'profile-abc' },  // profile.id ✅
          order: { submitted_at: 'DESC' },
        }),
      );
    });

    /**
     * TEST: Validates that getStruggleAreas uses profile.id
     */
    it('should fetch submissions for struggle areas using profile.id', async () => {
      const mockProfile = {
        id: 'profile-struggle',
        user_id: 'user-struggle',
        email: 'student@test.com',
        created_at: new Date(),
      };

      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockProfile as any);
      jest.spyOn(submissionRepository, 'find').mockResolvedValue([]);

      await service.getStruggleAreas('profile-struggle');

      expect(submissionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'profile-struggle' },  // profile.id ✅
          order: { submitted_at: 'DESC' },
        }),
      );
    });

    /**
     * TEST: Validates that profile not found throws NotFoundException
     */
    it('should throw NotFoundException if student profile does not exist', async () => {
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getStudentStats('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.getStudentStats('nonexistent-id')).rejects.toThrow(
        'Student with ID nonexistent-id not found',
      );
    });

    /**
     * INTEGRATION TEST: Validates entire getStudentProgress flow uses profile.id
     */
    it('should use profile.id across all queries in getStudentProgress', async () => {
      const mockProfile = {
        id: 'profile-full',
        user_id: 'user-full',
        email: 'student@test.com',
        full_name: 'Full Test',
        display_name: 'Full',
        avatar_url: null,
        created_at: new Date(),
        last_sign_in_at: new Date(),
      };

      const query = { time_range: 'all', status: 'all' };

      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockProfile as any);
      jest.spyOn(profileRepository, 'find').mockResolvedValue([mockProfile as any]);
      jest.spyOn(submissionRepository, 'find').mockResolvedValue([]);
      jest.spyOn(moduleProgressRepository, 'find').mockResolvedValue([]);

      await service.getStudentProgress('profile-full', query as any);

      // Verify ALL submission queries use profile.id
      const submissionCalls = (submissionRepository.find as jest.Mock).mock.calls;

      // Should have at least 3 calls: getStudentStats, getExerciseHistory, getStruggleAreas
      expect(submissionCalls.length).toBeGreaterThanOrEqual(3);

      // All calls should use profile.id
      submissionCalls.forEach((call) => {
        const whereClause = call[0]?.where;
        if (whereClause && whereClause.user_id) {
          expect(whereClause.user_id).toBe('profile-full'); // profile.id ✅
          expect(whereClause.user_id).not.toBe('user-full'); // NOT profile.user_id ❌
        }
      });
    });
  });

  describe('CORR-002: Real gamification data from user_stats', () => {
    /**
     * CRITICAL TEST: Validates that getStudentOverview returns REAL gamification data
     * from user_stats, NOT hardcoded values
     *
     * WHY THIS TEST?
     * - Original code had hardcoded: maya_rank='ah_kin', level=12, xp=3450, coins=890
     * - user_stats table has ACTUAL user data
     * - Teacher Portal was showing INCORRECT gamification data
     */
    it('should return real user_stats data, not hardcoded values', async () => {
      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-456',
        email: 'student@test.com',
        full_name: 'John Doe',
        display_name: 'John',
        avatar_url: null,
        created_at: new Date(),
        last_sign_in_at: new Date(),
      };

      const mockUserStats = {
        id: 'stats-789',
        user_id: 'profile-123',
        current_rank: 'Ix Chel',       // REAL data from user_stats
        level: 8,                       // REAL data
        total_xp: 2500,                 // REAL data
        ml_coins: 450,                  // REAL data
        current_streak: 12,             // REAL data
        max_streak: 20,                 // REAL data
        achievements_earned: 8,         // REAL data
      };

      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockProfile as any);
      jest.spyOn(userStatsRepository, 'findOne').mockResolvedValue(mockUserStats as any);

      const result = await service.getStudentOverview('profile-123');

      // Verify REAL data is used
      expect(result.maya_rank).toBe('Ix Chel');         // NOT 'ah_kin'
      expect(result.current_level).toBe(8);             // NOT 12
      expect(result.total_xp).toBe(2500);               // NOT 3450
      expect(result.total_ml_coins).toBe(450);          // NOT 890

      // CRITICAL NEGATIVE ASSERTIONS: Ensure hardcoded values are NOT returned
      expect(result.maya_rank).not.toBe('ah_kin');
      expect(result.current_level).not.toBe(12);
      expect(result.total_xp).not.toBe(3450);
      expect(result.total_ml_coins).not.toBe(890);
    });

    /**
     * TEST: Validates that getStudentStats returns real streak and achievements data
     */
    it('should return real streak and achievements from user_stats', async () => {
      const mockProfile = {
        id: 'profile-456',
        user_id: 'user-789',
        email: 'student2@test.com',
        created_at: new Date(),
      };

      const mockUserStats = {
        id: 'stats-abc',
        user_id: 'profile-456',
        current_streak: 15,              // REAL data
        max_streak: 30,                  // REAL data
        achievements_earned: 12,         // REAL data
      };

      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockProfile as any);
      jest.spyOn(submissionRepository, 'find').mockResolvedValue([]);
      jest.spyOn(moduleProgressRepository, 'find').mockResolvedValue([]);
      jest.spyOn(userStatsRepository, 'findOne').mockResolvedValue(mockUserStats as any);

      const result = await service.getStudentStats('profile-456');

      // Verify REAL streak and achievements data
      expect(result.current_streak_days).toBe(15);      // NOT 7
      expect(result.longest_streak_days).toBe(30);      // NOT 15
      expect(result.achievements_unlocked).toBe(12);    // NOT 12 (but from DB)

      // CRITICAL: Ensure NOT hardcoded values
      expect(result.current_streak_days).not.toBe(7);
    });

    /**
     * TEST: Validates default values when user_stats doesn't exist
     */
    it('should handle missing user_stats with sensible defaults', async () => {
      const mockProfile = {
        id: 'profile-no-stats',
        user_id: 'user-no-stats',
        email: 'newstudent@test.com',
        full_name: 'New Student',
        display_name: 'New',
        avatar_url: null,
        created_at: new Date(),
        last_sign_in_at: new Date(),
      };

      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockProfile as any);
      jest.spyOn(userStatsRepository, 'findOne').mockResolvedValue(null); // No stats exist

      const result = await service.getStudentOverview('profile-no-stats');

      // Verify default values are used
      expect(result.maya_rank).toBe('Ajaw');            // Default rank
      expect(result.current_level).toBe(1);             // Default level
      expect(result.total_xp).toBe(0);                  // Default XP
      expect(result.total_ml_coins).toBe(0);            // Default coins
    });

    /**
     * TEST: Validates that userStatsRepository.findOne is called with correct user_id
     */
    it('should query user_stats with profile.id', async () => {
      const mockProfile = {
        id: 'profile-query-test',
        user_id: 'user-query-test',
        email: 'test@example.com',
        full_name: 'Query Test',
        display_name: 'Query',
        avatar_url: null,
        created_at: new Date(),
        last_sign_in_at: new Date(),
      };

      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockProfile as any);
      jest.spyOn(userStatsRepository, 'findOne').mockResolvedValue(null);

      await service.getStudentOverview('profile-query-test');

      // Verify user_stats query uses profile.id
      expect(userStatsRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'profile-query-test' },  // profile.id ✅
        }),
      );

      // Ensure NOT using profile.user_id
      expect(userStatsRepository.findOne).not.toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 'user-query-test' },  // profile.user_id ❌
        }),
      );
    });
  });

  describe('Basic functionality', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should return student overview with correct structure', async () => {
      const mockProfile = {
        id: 'student-id',
        user_id: 'user-id',
        email: 'student@test.com',
        full_name: 'Test Student',
        display_name: 'Test',
        avatar_url: 'http://example.com/avatar.png',
        created_at: new Date('2024-01-01'),
        last_sign_in_at: new Date('2024-01-15'),
      };

      const mockUserStats = {
        id: 'stats-id',
        user_id: 'student-id',
        current_rank: 'Ah Kin',
        level: 5,
        total_xp: 1200,
        ml_coins: 500,
      };

      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockProfile as any);
      jest.spyOn(userStatsRepository, 'findOne').mockResolvedValue(mockUserStats as any);

      const result = await service.getStudentOverview('student-id');

      expect(result).toBeDefined();
      expect(result.id).toBe('student-id');
      expect(result.full_name).toBe('Test Student');
      expect(result.email).toBe('student@test.com');
      expect(result.avatar_url).toBe('http://example.com/avatar.png');
      expect(result).toHaveProperty('maya_rank');
      expect(result).toHaveProperty('current_level');
      expect(result).toHaveProperty('total_xp');
      expect(result).toHaveProperty('total_ml_coins');
    });
  });
});
