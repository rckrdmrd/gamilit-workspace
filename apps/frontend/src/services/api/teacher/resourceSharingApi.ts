/**
 * Resource Sharing API Client
 *
 * API Service for browsing, rating, commenting, and downloading shared educational resources.
 * Powers the ResourceSharingPanel in the teacher collaboration tab.
 *
 * @module services/api/teacher/resourceSharingApi
 */

import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { handleAPIError } from '../apiErrorHandler';
import type { SharedResource } from '@/apps/teacher/types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Query parameters for searching shared resources
 */
export interface SearchResourcesParams {
  type?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'created_at' | 'rating' | 'downloads' | 'title';
  sort_order?: 'asc' | 'desc';
}

/**
 * Shared resource from API (backend SharedResourceResponseDto)
 */
export interface SharedResourceResponse {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  author_id: string;
  author_name: string;
  shared_at: string;
  rating: number;
  ratings_count: number;
  downloads: number;
  comments_count: number;
  tags: string[];
  user_rating?: number;
}

/**
 * Paginated shared resources response
 */
export interface SharedResourcesListResponse {
  data: SharedResourceResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Comment on a resource
 */
export interface ResourceComment {
  id: string;
  author_id: string;
  author_name: string;
  text: string;
  created_at: string;
}

/**
 * Paginated comments response
 */
export interface CommentsListResponse {
  data: ResourceComment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Rating response
 */
export interface RatingResponse {
  rating: number;
  ratings_count: number;
}

/**
 * Download response
 */
export interface DownloadResponse {
  success: boolean;
  downloads: number;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Maps API SharedResourceResponse to frontend SharedResource type
 */
export function mapToSharedResource(
  resource: SharedResourceResponse,
  comments: ResourceComment[] = [],
): SharedResource {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    type: resource.type as SharedResource['type'],
    category: resource.category,
    author_id: resource.author_id,
    author_name: resource.author_name,
    shared_at: resource.shared_at,
    rating: resource.rating,
    ratings_count: resource.ratings_count,
    downloads: resource.downloads,
    comments: comments.map((c) => ({
      id: c.id,
      author_name: c.author_name,
      text: c.text,
      created_at: c.created_at,
    })),
    tags: resource.tags,
  };
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * API Client for Resource Sharing
 *
 * Endpoints:
 * - GET /teacher/content/resources — list shared resources
 * - GET /teacher/content/resources/:id — get resource details
 * - POST /teacher/content/resources/:id/rate — rate a resource
 * - GET /teacher/content/resources/:id/comments — get comments
 * - POST /teacher/content/resources/:id/comments — add comment
 * - POST /teacher/content/resources/:id/download — record download
 */
export const resourceSharingApi = {
  /**
   * Search and browse shared resources
   */
  getResources: async (params: SearchResourcesParams = {}): Promise<SharedResourcesListResponse> => {
    try {
      const { data } = await apiClient.get<SharedResourcesListResponse>(API_ENDPOINTS.teacher.resources.list, { params });
      return data;
    } catch (error) {
      throw handleAPIError(error, 'Failed to fetch shared resources');
    }
  },

  /**
   * Get a single shared resource by ID
   */
  getResourceById: async (resourceId: string): Promise<SharedResourceResponse> => {
    try {
      const { data } = await apiClient.get<SharedResourceResponse>(API_ENDPOINTS.teacher.resources.get(resourceId));
      return data;
    } catch (error) {
      throw handleAPIError(error, 'Failed to fetch resource details');
    }
  },

  /**
   * Rate a resource (1-5), upserts existing rating
   */
  rateResource: async (resourceId: string, rating: number): Promise<RatingResponse> => {
    try {
      const { data } = await apiClient.post<RatingResponse>(API_ENDPOINTS.teacher.resources.rate(resourceId), { rating });
      return data;
    } catch (error) {
      throw handleAPIError(error, 'Failed to rate resource');
    }
  },

  /**
   * Get paginated comments for a resource
   */
  getComments: async (resourceId: string, page = 1, limit = 20): Promise<CommentsListResponse> => {
    try {
      const { data } = await apiClient.get<CommentsListResponse>(API_ENDPOINTS.teacher.resources.comments(resourceId), {
        params: { page, limit },
      });
      return data;
    } catch (error) {
      throw handleAPIError(error, 'Failed to fetch resource comments');
    }
  },

  /**
   * Add a comment to a resource
   */
  addComment: async (resourceId: string, text: string): Promise<ResourceComment> => {
    try {
      const { data } = await apiClient.post<ResourceComment>(API_ENDPOINTS.teacher.resources.comments(resourceId), { text });
      return data;
    } catch (error) {
      throw handleAPIError(error, 'Failed to add comment');
    }
  },

  /**
   * Record a download of a resource
   */
  recordDownload: async (resourceId: string): Promise<DownloadResponse> => {
    try {
      const { data } = await apiClient.post<DownloadResponse>(API_ENDPOINTS.teacher.resources.download(resourceId));
      return data;
    } catch (error) {
      throw handleAPIError(error, 'Failed to record download');
    }
  },
};
