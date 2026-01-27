/**
 * Content API Service
 *
 * @description API service for content templates, categories, and authors management
 * @created 2026-01-27 - P1-001 Frontend Coverage Gap Fix
 * @module content
 */

import { apiClient } from './apiClient';

// ============================================================================
// TYPES
// ============================================================================

export interface ContentTemplate {
  id: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  content: Record<string, unknown>;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContentCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
}

export interface ContentAuthor {
  id: string;
  name: string;
  email?: string;
  bio?: string;
  avatar?: string;
  contentCount: number;
}

export interface TemplateFilters {
  type?: string;
  category?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================================================
// TEMPLATES API
// ============================================================================

export const templatesAPI = {
  getAll: async (filters?: TemplateFilters): Promise<ContentTemplate[]> => {
    const response = await apiClient.get('/content/templates', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<ContentTemplate> => {
    const response = await apiClient.get(`/content/templates/${id}`);
    return response.data;
  },

  create: async (data: Partial<ContentTemplate>): Promise<ContentTemplate> => {
    const response = await apiClient.post('/content/templates', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ContentTemplate>): Promise<ContentTemplate> => {
    const response = await apiClient.patch(`/content/templates/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/content/templates/${id}`);
  },

  incrementUsage: async (id: string): Promise<ContentTemplate> => {
    const response = await apiClient.post(`/content/templates/${id}/use`);
    return response.data;
  },

  getByType: async (type: string): Promise<ContentTemplate[]> => {
    const response = await apiClient.get(`/content/templates/type/${type}`);
    return response.data;
  },

  getByCategory: async (category: string): Promise<ContentTemplate[]> => {
    const response = await apiClient.get(`/content/templates/category/${category}`);
    return response.data;
  },

  getPopular: async (limit = 10): Promise<ContentTemplate[]> => {
    const response = await apiClient.get('/content/templates/popular', { params: { limit } });
    return response.data;
  }
};

// ============================================================================
// CATEGORIES API
// ============================================================================

export const categoriesAPI = {
  getAll: async (): Promise<ContentCategory[]> => {
    const response = await apiClient.get('/content/categories');
    return response.data;
  },

  getById: async (id: string): Promise<ContentCategory> => {
    const response = await apiClient.get(`/content/categories/${id}`);
    return response.data;
  },

  create: async (data: Partial<ContentCategory>): Promise<ContentCategory> => {
    const response = await apiClient.post('/content/categories', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ContentCategory>): Promise<ContentCategory> => {
    const response = await apiClient.patch(`/content/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/content/categories/${id}`);
  }
};

// ============================================================================
// AUTHORS API
// ============================================================================

export const authorsAPI = {
  getAll: async (): Promise<ContentAuthor[]> => {
    const response = await apiClient.get('/content/authors');
    return response.data;
  },

  getById: async (id: string): Promise<ContentAuthor> => {
    const response = await apiClient.get(`/content/authors/${id}`);
    return response.data;
  },

  create: async (data: Partial<ContentAuthor>): Promise<ContentAuthor> => {
    const response = await apiClient.post('/content/authors', data);
    return response.data;
  }
};

// ============================================================================
// UNIFIED CONTENT API
// ============================================================================

export const contentAPI = {
  templates: templatesAPI,
  categories: categoriesAPI,
  authors: authorsAPI
};

export default contentAPI;
