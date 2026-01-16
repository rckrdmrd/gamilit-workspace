/**
 * Tag Entity
 *
 * Mapea a la tabla: content_management.tags
 *
 * Etiquetas para categorización de contenido educativo.
 * Incluye categorías como personas, conceptos científicos, ubicaciones, etc.
 *
 * @see DDL: apps/database/ddl/schemas/content_management/tables/07-tags.sql
 * @created 2026-01-14 - Alineación BD-Backend
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DB_SCHEMAS, DB_TABLES } from '@/shared/constants/database.constants';

export enum TagCategory {
  PERSON = 'person',
  SCIENTIFIC_CONCEPT = 'scientific_concept',
  LOCATION = 'location',
  ACHIEVEMENT = 'achievement',
  HISTORICAL_EVENT = 'historical_event',
  SUBJECT = 'subject',
  THEME = 'theme',
  VALUE = 'value',
  METHOD = 'method',
}

@Entity({ schema: DB_SCHEMAS.CONTENT, name: DB_TABLES.CONTENT.TAGS })
@Index(['tagSlug'])
@Index(['tagCategory'])
@Index(['isActive'])
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { name: 'tag_name', length: 100 })
  tagName!: string;

  @Column('varchar', { name: 'tag_slug', length: 120, unique: true })
  tagSlug!: string;

  @Column({
    type: 'varchar',
    name: 'tag_category',
    length: 50,
  })
  tagCategory!: TagCategory;

  @Column('text', { nullable: true })
  description!: string | null;

  @Column('int', { name: 'usage_count', default: 0 })
  usageCount!: number;

  @Column('boolean', { name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt!: Date;
}
