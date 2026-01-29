/**
 * Parent Portal Store
 *
 * EXT-011 Parent Portal - Zustand State Management
 *
 * @description State management for parent portal using Zustand.
 * Handles authentication, dashboard data, and student management.
 *
 * @see ET-PAR-001-parent-authentication.md
 * @see ET-PAR-002-portal-dashboard.md
 * @created 2026-01-27
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { parentAPI } from '../api/parentAPI';
import type {
  ParentState,
  ParentLoginCredentials,
  ParentRegisterData,
  LinkStudentData,
  VerifyLinkData,
} from '../types/parent.types';

/**
 * Parent Store
 */
export const useParentStore = create<ParentState>()(
  persist(
    (set, get) => ({
      // Initial State
      account: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      students: [],
      progressSummaries: [],
      recentActivities: [],
      upcomingAssignments: [],
      unreadNotifications: 0,
      notifications: [],
      weeklyReports: [],

      selectedStudentId: null,

      // =========================================================
      // AUTH ACTIONS
      // =========================================================

      login: async (credentials: ParentLoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await parentAPI.login(credentials);

          // Store tokens
          localStorage.setItem('parent-access-token', response.tokens.accessToken);
          localStorage.setItem('parent-refresh-token', response.tokens.refreshToken);

          set({
            account: response.account,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesion';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (data: ParentRegisterData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await parentAPI.register(data);

          // Store tokens
          localStorage.setItem('parent-access-token', response.tokens.accessToken);
          localStorage.setItem('parent-refresh-token', response.tokens.refreshToken);

          set({
            account: response.account,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error al registrarse';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        // Clear tokens
        localStorage.removeItem('parent-access-token');
        localStorage.removeItem('parent-refresh-token');
        localStorage.removeItem('parent-storage');

        // Reset state
        set({
          account: null,
          tokens: null,
          isAuthenticated: false,
          students: [],
          progressSummaries: [],
          recentActivities: [],
          upcomingAssignments: [],
          unreadNotifications: 0,
          notifications: [],
          weeklyReports: [],
          selectedStudentId: null,
          error: null,
        });
      },

      refreshSession: async () => {
        const { tokens } = get();

        if (!tokens?.refreshToken) {
          throw new Error('No hay token de refresco');
        }

        try {
          const newTokens = await parentAPI.refreshToken(tokens.refreshToken);

          localStorage.setItem('parent-access-token', newTokens.accessToken);
          localStorage.setItem('parent-refresh-token', newTokens.refreshToken);

          set({
            tokens: newTokens,
          });
        } catch (error) {
          get().logout();
          throw error;
        }
      },

      // =========================================================
      // DASHBOARD ACTIONS
      // =========================================================

      loadDashboard: async () => {
        set({ isLoading: true });

        try {
          const dashboard = await parentAPI.getDashboard();

          set({
            students: dashboard.students,
            progressSummaries: dashboard.progressSummaries,
            recentActivities: dashboard.recentActivities,
            upcomingAssignments: dashboard.upcomingAssignments,
            unreadNotifications: dashboard.unreadNotifications,
            isLoading: false,
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error al cargar dashboard';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      loadStudentProgress: async (studentId: string) => {
        try {
          const progress = await parentAPI.getStudentProgress(studentId);

          // Update the progress summary for this student
          set((state) => ({
            progressSummaries: state.progressSummaries.map((p) =>
              p.studentId === studentId ? progress : p,
            ),
          }));

          return progress;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error al cargar progreso';
          set({ error: errorMessage });
          throw error;
        }
      },

      // =========================================================
      // STUDENT LINKING ACTIONS
      // =========================================================

      linkStudent: async (data: LinkStudentData) => {
        set({ isLoading: true, error: null });

        try {
          await parentAPI.linkStudent(data);
          set({ isLoading: false });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error al vincular estudiante';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      verifyLink: async (data: VerifyLinkData) => {
        set({ isLoading: true, error: null });

        try {
          const linkedStudent = await parentAPI.verifyStudentLink(data);

          // Add to students list
          set((state) => ({
            students: [...state.students, linkedStudent],
            isLoading: false,
          }));
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error al verificar vinculo';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // =========================================================
      // NOTIFICATION ACTIONS
      // =========================================================

      loadNotifications: async () => {
        try {
          const [notifications, count] = await Promise.all([
            parentAPI.getNotifications(),
            parentAPI.getUnreadNotificationCount(),
          ]);

          set({
            notifications,
            unreadNotifications: count,
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error al cargar notificaciones';
          set({ error: errorMessage });
          throw error;
        }
      },

      markNotificationRead: async (notificationId: string) => {
        try {
          await parentAPI.markNotificationRead(notificationId);

          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === notificationId
                ? { ...n, status: 'read' as const, readAt: new Date().toISOString() }
                : n,
            ),
            unreadNotifications: Math.max(0, state.unreadNotifications - 1),
          }));
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Error al marcar notificacion';
          set({ error: errorMessage });
          throw error;
        }
      },

      // =========================================================
      // UI STATE ACTIONS
      // =========================================================

      selectStudent: (studentId: string | null) => {
        set({ selectedStudentId: studentId });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'parent-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        account: state.account,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectParentAccount = (state: ParentState) => state.account;
export const selectIsAuthenticated = (state: ParentState) => state.isAuthenticated;
export const selectStudents = (state: ParentState) => state.students;
export const selectSelectedStudent = (state: ParentState) => {
  if (!state.selectedStudentId) return null;
  return state.students.find((s) => s.studentId === state.selectedStudentId) || null;
};
export const selectSelectedStudentProgress = (state: ParentState) => {
  if (!state.selectedStudentId) return null;
  return state.progressSummaries.find((p) => p.studentId === state.selectedStudentId) || null;
};
export const selectUnreadCount = (state: ParentState) => state.unreadNotifications;

export default useParentStore;
