import { Expose, Transform } from 'class-transformer';

/**
 * Helper para convertir Date a ISO string de forma segura
 */
const toISOString = ({ value }: { value: unknown }) => {
  if (!value) return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return value;
};

/**
 * UserDetailsDto
 * Response con detalles completos de un usuario
 *
 * @description Los campos de fecha usan @Transform con toPlainOnly
 * para serializar Date a ISO string solo en la respuesta JSON.
 */
export class UserDetailsDto {
  @Expose()
    id!: string;

  @Expose()
    email!: string;

  @Expose()
    role!: string;

  @Expose()
    tenant_id?: string;

  @Expose()
    organization_id?: string;

  @Expose()
    organization_name?: string;

  @Expose()
    full_name?: string;

  @Expose()
    status!: string;

  @Expose()
    email_verified!: boolean;

  @Expose()
  @Transform(toISOString, { toPlainOnly: true })
    email_confirmed_at?: Date | string;

  /**
   * Fecha del último inicio de sesión
   * Serializado a ISO string para el frontend
   */
  @Expose()
  @Transform(toISOString, { toPlainOnly: true })
    last_sign_in_at?: Date | string;

  @Expose()
    raw_user_meta_data!: Record<string, unknown>;

  @Expose()
  @Transform(toISOString, { toPlainOnly: true })
    created_at!: Date | string;

  @Expose()
  @Transform(toISOString, { toPlainOnly: true })
    updated_at!: Date | string;
}
