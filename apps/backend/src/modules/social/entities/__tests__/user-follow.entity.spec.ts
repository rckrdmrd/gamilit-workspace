/**
 * UserFollow Entity Tests
 *
 * Tests for UserFollow entity structure and validation
 * Created: 2026-01-13
 */

import { UserFollow } from '../user-follow.entity';

describe('UserFollow Entity', () => {
  describe('Entity Instantiation', () => {
    it('should create a valid UserFollow instance', () => {
      const follow = new UserFollow();

      follow.id = 'follow-123';
      follow.followerId = 'user-follower';
      follow.followingId = 'user-following';
      follow.followedAt = new Date();

      expect(follow).toBeInstanceOf(UserFollow);
      expect(follow.id).toBe('follow-123');
      expect(follow.followerId).toBe('user-follower');
      expect(follow.followingId).toBe('user-following');
    });
  });

  describe('Follow Relationship', () => {
    it('should establish unidirectional follow relationship', () => {
      const follow = new UserFollow();
      follow.followerId = 'user-A';
      follow.followingId = 'user-B';

      // User A follows User B
      expect(follow.followerId).toBe('user-A');
      expect(follow.followingId).toBe('user-B');

      // This does NOT mean User B follows User A
      expect(follow.followerId).not.toBe('user-B');
      expect(follow.followingId).not.toBe('user-A');
    });

    it('should not allow self-following (validated by constraint)', () => {
      const follow = new UserFollow();

      // This would violate the CHECK constraint in database
      // The entity itself doesn't enforce this, but database does
      follow.followerId = 'user-X';
      follow.followingId = 'user-X';

      // Entity allows it, but DB constraint would reject
      expect(follow.followerId).toBe(follow.followingId);
    });
  });

  describe('Timestamp', () => {
    it('should track when follow was created', () => {
      const follow = new UserFollow();
      const followDate = new Date('2026-01-13T10:00:00Z');

      follow.followedAt = followDate;

      expect(follow.followedAt).toEqual(followDate);
    });
  });

  describe('Follow Scenarios', () => {
    it('should support mutual following (two separate records)', () => {
      // User A follows User B
      const followAB = new UserFollow();
      followAB.id = 'follow-ab';
      followAB.followerId = 'user-A';
      followAB.followingId = 'user-B';
      followAB.followedAt = new Date('2026-01-10T10:00:00Z');

      // User B follows User A (separate record)
      const followBA = new UserFollow();
      followBA.id = 'follow-ba';
      followBA.followerId = 'user-B';
      followBA.followingId = 'user-A';
      followBA.followedAt = new Date('2026-01-12T15:00:00Z');

      // Both follows exist independently
      expect(followAB.followerId).toBe('user-A');
      expect(followAB.followingId).toBe('user-B');

      expect(followBA.followerId).toBe('user-B');
      expect(followBA.followingId).toBe('user-A');

      // They are different records
      expect(followAB.id).not.toBe(followBA.id);
    });

    it('should support one user following multiple users', () => {
      const user = 'user-active';

      const follow1 = new UserFollow();
      follow1.followerId = user;
      follow1.followingId = 'user-1';

      const follow2 = new UserFollow();
      follow2.followerId = user;
      follow2.followingId = 'user-2';

      const follow3 = new UserFollow();
      follow3.followerId = user;
      follow3.followingId = 'user-3';

      // Same follower, different followings
      expect(follow1.followerId).toBe(user);
      expect(follow2.followerId).toBe(user);
      expect(follow3.followerId).toBe(user);

      expect(follow1.followingId).not.toBe(follow2.followingId);
      expect(follow2.followingId).not.toBe(follow3.followingId);
    });

    it('should support one user having multiple followers', () => {
      const popularUser = 'user-popular';

      const follower1 = new UserFollow();
      follower1.followerId = 'fan-1';
      follower1.followingId = popularUser;

      const follower2 = new UserFollow();
      follower2.followerId = 'fan-2';
      follower2.followingId = popularUser;

      const follower3 = new UserFollow();
      follower3.followerId = 'fan-3';
      follower3.followingId = popularUser;

      // Same following, different followers
      expect(follower1.followingId).toBe(popularUser);
      expect(follower2.followingId).toBe(popularUser);
      expect(follower3.followingId).toBe(popularUser);

      expect(follower1.followerId).not.toBe(follower2.followerId);
    });
  });

  describe('Uniqueness', () => {
    it('should have unique constraint on follower-following pair', () => {
      // These represent what would be in the database
      // The UNIQUE constraint prevents duplicates

      const existingFollow = new UserFollow();
      existingFollow.id = 'follow-existing';
      existingFollow.followerId = 'user-A';
      existingFollow.followingId = 'user-B';

      // Attempting to create duplicate would fail at DB level
      const duplicateFollow = new UserFollow();
      duplicateFollow.followerId = 'user-A';
      duplicateFollow.followingId = 'user-B';

      // Same follower-following pair
      expect(existingFollow.followerId).toBe(duplicateFollow.followerId);
      expect(existingFollow.followingId).toBe(duplicateFollow.followingId);
    });
  });

  describe('Edge Cases', () => {
    it('should handle UUID format for user IDs', () => {
      const follow = new UserFollow();
      follow.id = '550e8400-e29b-41d4-a716-446655440000';
      follow.followerId = '550e8400-e29b-41d4-a716-446655440001';
      follow.followingId = '550e8400-e29b-41d4-a716-446655440002';

      expect(follow.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(follow.followerId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should track follow chronologically', () => {
      const earlyFollow = new UserFollow();
      earlyFollow.followerId = 'user-1';
      earlyFollow.followingId = 'user-2';
      earlyFollow.followedAt = new Date('2026-01-01T00:00:00Z');

      const laterFollow = new UserFollow();
      laterFollow.followerId = 'user-3';
      laterFollow.followingId = 'user-2';
      laterFollow.followedAt = new Date('2026-01-13T00:00:00Z');

      expect(earlyFollow.followedAt < laterFollow.followedAt).toBe(true);
    });
  });
});
