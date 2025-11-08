// ========================================
// CORRECCIÓN C1.1.3: Crear GamilitRoleEnum
// ========================================

/**
 * ENUM para roles de usuario en Gamilit
 * Corresponde a: public.gamilit_role en PostgreSQL
 *
 * Valores en DB:
 * - student: Estudiante (usuario final)
 * - admin_teacher: Profesor con permisos administrativos
 * - super_admin: Administrador del sistema
 *
 * NOTA: Este es diferente a UserRole que es más genérico
 * GamilitRole es específico del negocio de Gamilit
 */
export enum GamilitRoleEnum {
  STUDENT = 'student',
  ADMIN_TEACHER = 'admin_teacher',
  SUPER_ADMIN = 'super_admin'
}
