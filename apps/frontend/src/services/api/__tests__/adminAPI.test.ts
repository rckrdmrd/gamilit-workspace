/**
 * Admin API Tests - CORR-003
 *
 * Tests for user data transformation (last_sign_in_at → lastLogin)
 * Created: 2025-11-24
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUsers } from '../adminAPI';
import { apiClient } from '@/services/api/apiClient';

// Mock apiClient
vi.mock('../apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

// Mock error handler
vi.mock('../apiErrorHandler', () => ({
  handleAPIError: vi.fn((_error, message) => {
    throw new Error(message);
  }),
}));

describe('adminAPI.getUsers - CORR-003', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Field Transformation: last_sign_in_at → lastLogin', () => {
    it('should transform last_sign_in_at to lastLogin in array response', async () => {
      const mockBackendResponse = {
        data: {
          data: [
            {
              id: 'user-123',
              full_name: 'John Doe',
              email: 'john@example.com',
              role: 'student',
              status: 'active',
              last_sign_in_at: '2025-11-24T10:30:00Z',
              created_at: '2025-01-01T00:00:00Z',
              organization_id: 'org-456',
              organization_name: 'Test School',
            },
          ],
        },
      };

      (apiClient.get as any).mockResolvedValue(mockBackendResponse);

      const result = await getUsers();

      // ✅ Verify transformation applied
      expect(result.items[0].lastLogin).toBe('2025-11-24T10:30:00Z');
      expect(result.items[0].name).toBe('John Doe');
      expect(result.items[0].email).toBe('john@example.com');
      expect(result.items[0].role).toBe('student');
      expect(result.items[0].status).toBe('active');
      expect(result.items[0].organizationId).toBe('org-456');
      expect(result.items[0].organization).toBe('Test School');

      // ✅ Should NOT have snake_case fields
      expect((result.items[0] as any).last_sign_in_at).toBeUndefined();
      expect((result.items[0] as any).full_name).toBeUndefined();
      expect((result.items[0] as any).created_at).toBeUndefined();
      expect((result.items[0] as any).organization_id).toBeUndefined();
      expect((result.items[0] as any).organization_name).toBeUndefined();
    });

    it('should handle null last_sign_in_at', async () => {
      const mockBackendResponse = {
        data: {
          data: [
            {
              id: 'user-456',
              full_name: 'Jane Doe',
              email: 'jane@example.com',
              role: 'student',
              status: 'active',
              last_sign_in_at: null,
              created_at: '2025-01-01T00:00:00Z',
            },
          ],
        },
      };

      (apiClient.get as any).mockResolvedValue(mockBackendResponse);

      const result = await getUsers();

      // ✅ Should handle null value
      expect(result.items[0].lastLogin).toBeNull();
      expect(result.items[0].name).toBe('Jane Doe');
    });

    it('should transform last_sign_in_at in paginated response', async () => {
      const mockBackendResponse = {
        data: {
          data: {
            data: [
              {
                id: 'user-789',
                full_name: 'Alice Smith',
                email: 'alice@example.com',
                role: 'admin_teacher',
                status: 'active',
                last_sign_in_at: '2025-11-23T15:45:00Z',
                created_at: '2024-12-01T00:00:00Z',
              },
            ],
            page: 1,
            limit: 10,
            total: 1,
            total_pages: 1,
          },
        },
      };

      (apiClient.get as any).mockResolvedValue(mockBackendResponse);

      const result = await getUsers();

      // ✅ Verify transformation in paginated response
      expect(result.items[0].lastLogin).toBe('2025-11-23T15:45:00Z');
      expect(result.items[0].name).toBe('Alice Smith');
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.totalItems).toBe(1);

      // ✅ Should NOT have snake_case fields
      expect((result.items[0] as any).last_sign_in_at).toBeUndefined();
    });

    it('should handle undefined last_sign_in_at', async () => {
      const mockBackendResponse = {
        data: {
          data: [
            {
              id: 'user-999',
              full_name: 'Bob Johnson',
              email: 'bob@example.com',
              role: 'student',
              status: 'inactive',
              // last_sign_in_at is undefined (user never logged in)
              created_at: '2025-11-01T00:00:00Z',
            },
          ],
        },
      };

      (apiClient.get as any).mockResolvedValue(mockBackendResponse);

      const result = await getUsers();

      // ✅ Should handle undefined value
      expect(result.items[0].lastLogin).toBeUndefined();
      expect(result.items[0].name).toBe('Bob Johnson');
    });
  });

  describe('Name Field Transformation', () => {
    it('should prioritize full_name over other name fields', async () => {
      const mockBackendResponse = {
        data: {
          data: [
            {
              id: 'user-111',
              full_name: 'John Smith',
              display_name: 'Johnny',
              name: 'John',
              email: 'john@test.com',
              role: 'student',
              status: 'active',
              created_at: '2025-01-01T00:00:00Z',
            },
          ],
        },
      };

      (apiClient.get as any).mockResolvedValue(mockBackendResponse);

      const result = await getUsers();

      // ✅ Should use full_name
      expect(result.items[0].name).toBe('John Smith');
    });

    it('should fallback to display_name if full_name is missing', async () => {
      const mockBackendResponse = {
        data: {
          data: [
            {
              id: 'user-222',
              display_name: 'Johnny',
              email: 'john@test.com',
              role: 'student',
              status: 'active',
              created_at: '2025-01-01T00:00:00Z',
            },
          ],
        },
      };

      (apiClient.get as any).mockResolvedValue(mockBackendResponse);

      const result = await getUsers();

      // ✅ Should use display_name
      expect(result.items[0].name).toBe('Johnny');
    });

    it('should fallback to email if no name fields exist', async () => {
      const mockBackendResponse = {
        data: {
          data: [
            {
              id: 'user-333',
              email: 'noname@test.com',
              role: 'student',
              status: 'active',
              created_at: '2025-01-01T00:00:00Z',
            },
          ],
        },
      };

      (apiClient.get as any).mockResolvedValue(mockBackendResponse);

      const result = await getUsers();

      // ✅ Should use email as fallback
      expect(result.items[0].name).toBe('noname@test.com');
    });
  });

  describe('Organization Field Transformation', () => {
    it('should transform organization_name to organization', async () => {
      const mockBackendResponse = {
        data: {
          data: [
            {
              id: 'user-444',
              full_name: 'Test User',
              email: 'test@org.com',
              role: 'student',
              status: 'active',
              organization_id: 'org-123',
              organization_name: 'Test University',
              created_at: '2025-01-01T00:00:00Z',
            },
          ],
        },
      };

      (apiClient.get as any).mockResolvedValue(mockBackendResponse);

      const result = await getUsers();

      // ✅ Should transform organization fields
      expect(result.items[0].organization).toBe('Test University');
      expect(result.items[0].organizationId).toBe('org-123');

      // ✅ Should NOT have snake_case fields
      expect((result.items[0] as any).organization_name).toBeUndefined();
      expect((result.items[0] as any).organization_id).toBeUndefined();
    });
  });

  describe('Date Field Transformation', () => {
    it('should transform created_at to joinDate', async () => {
      const mockBackendResponse = {
        data: {
          data: [
            {
              id: 'user-555',
              full_name: 'Test User',
              email: 'test@date.com',
              role: 'student',
              status: 'active',
              created_at: '2025-01-15T08:00:00Z',
            },
          ],
        },
      };

      (apiClient.get as any).mockResolvedValue(mockBackendResponse);

      const result = await getUsers();

      // ✅ Should transform joinDate
      expect(result.items[0].joinDate).toBe('2025-01-15T08:00:00Z');

      // ✅ Should NOT have snake_case field
      expect((result.items[0] as any).created_at).toBeUndefined();
    });
  });

  describe('Multiple Users Transformation', () => {
    it('should transform all users in array', async () => {
      const mockBackendResponse = {
        data: {
          data: [
            {
              id: 'user-1',
              full_name: 'User One',
              email: 'one@test.com',
              role: 'student',
              status: 'active',
              last_sign_in_at: '2025-11-24T10:00:00Z',
              created_at: '2025-01-01T00:00:00Z',
            },
            {
              id: 'user-2',
              full_name: 'User Two',
              email: 'two@test.com',
              role: 'admin_teacher',
              status: 'active',
              last_sign_in_at: '2025-11-23T14:30:00Z',
              created_at: '2024-12-01T00:00:00Z',
            },
            {
              id: 'user-3',
              full_name: 'User Three',
              email: 'three@test.com',
              role: 'student',
              status: 'inactive',
              last_sign_in_at: null,
              created_at: '2025-02-01T00:00:00Z',
            },
          ],
        },
      };

      (apiClient.get as any).mockResolvedValue(mockBackendResponse);

      const result = await getUsers();

      // ✅ All users should be transformed
      expect(result.items).toHaveLength(3);

      result.items.forEach((user) => {
        // Should have camelCase fields
        expect(user.name).toBeDefined();
        expect(user.email).toBeDefined();
        // lastLogin may be null or a date string, but property should exist
        expect(user).toHaveProperty('lastLogin');
        expect(user.joinDate).toBeDefined();

        // Should NOT have snake_case fields
        expect((user as any).full_name).toBeUndefined();
        expect((user as any).last_sign_in_at).toBeUndefined();
        expect((user as any).created_at).toBeUndefined();
      });

      // Verify specific values
      expect(result.items[0].lastLogin).toBe('2025-11-24T10:00:00Z');
      expect(result.items[1].lastLogin).toBe('2025-11-23T14:30:00Z');
      expect(result.items[2].lastLogin).toBeNull();
    });
  });

  describe('Empty Response Handling', () => {
    it('should handle empty array', async () => {
      const mockBackendResponse = {
        data: {
          data: [],
        },
      };

      (apiClient.get as any).mockResolvedValue(mockBackendResponse);

      const result = await getUsers();

      expect(result.items).toEqual([]);
      expect(result.pagination.totalItems).toBe(0);
    });

    it('should handle empty paginated response', async () => {
      const mockBackendResponse = {
        data: {
          data: {
            data: [],
            page: 1,
            limit: 10,
            total: 0,
            total_pages: 0,
          },
        },
      };

      (apiClient.get as any).mockResolvedValue(mockBackendResponse);

      const result = await getUsers();

      expect(result.items).toEqual([]);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });
});
