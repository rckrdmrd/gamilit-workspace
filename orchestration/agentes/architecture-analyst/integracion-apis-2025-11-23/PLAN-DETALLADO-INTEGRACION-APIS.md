# PLAN DETALLADO: Integración de APIs Reales - Portales Admin y Teacher

**Fecha:** 2025-11-23
**Versión:** 1.0
**Responsable:** Frontend-Developer (con coordinación de Architecture-Analyst)
**Duración Estimada:** 5-7 días de desarrollo
**Prioridad:** P0 - Crítico para MVP

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Prerrequisitos](#prerrequisitos)
3. [Tarea 1: Integrar API Gamificación (US-AE-005)](#tarea-1-integrar-api-gamificación-us-ae-005)
4. [Tarea 2: Crear Seeds de Assignments](#tarea-2-crear-seeds-de-assignments)
5. [Tarea 3: Crear UI Asignaciones Classroom-Teacher (US-AE-007)](#tarea-3-crear-ui-asignaciones-classroom-teacher-us-ae-007)
6. [Tarea 4: Fix Gamification Data en Wrappers](#tarea-4-fix-gamification-data-en-wrappers)
7. [Validación Final](#validación-final)
8. [Checklist de Entrega](#checklist-de-entrega)

---

## RESUMEN EJECUTIVO

### Objetivo

Completar la integración de APIs reales en los portales Admin y Teacher, conectando el frontend con los endpoints backend ya implementados.

### Gaps a Resolver

| Gap | Tipo | Estimación | Prioridad |
|-----|------|------------|-----------|
| [GAP-001] API Gamificación | Integración Frontend | 2-3 días | P0 |
| [GAP-002] Seeds Assignments | Base de Datos | 4 horas | P0 |
| [GAP-003] UI Classroom-Teacher | Implementación Frontend | 3-4 días | P1 |
| [GAP-004] Gamification Wrappers | Refactor Frontend | 4 horas | P1 |

### Timeline

```
Día 1-2:   Tarea 1 - API Gamificación (core)
Día 2:     Tarea 2 - Seeds Assignments
Día 3-5:   Tarea 3 - UI Classroom-Teacher
Día 5:     Tarea 4 - Fix Wrappers
Día 5-6:   Testing y validación
Día 6-7:   Ajustes finales y documentación
```

---

## PRERREQUISITOS

### Validaciones Iniciales

```bash
# 1. Verificar que backend está corriendo
curl http://localhost:3000/api/admin/gamification/config/parameters

# 2. Verificar autenticación
# Login como admin@gamilit.com / Test1234
# Obtener token JWT

# 3. Verificar base de datos
psql -d gamilit_platform -c "SELECT COUNT(*) FROM system_configuration.gamification_parameters;"
# Debe retornar ~40+ parámetros

# 4. Verificar que frontend compila
cd apps/frontend
npm run build
```

### Herramientas Necesarias

- Node.js 18+
- PostgreSQL client
- VS Code (o editor preferido)
- Postman/Insomnia (para testing de APIs)
- Git (para commits)

### Conocimientos Requeridos

- React + TypeScript
- React Query / TanStack Query
- Axios/Fetch
- NestJS (para entender endpoints)
- PostgreSQL (para seeds)

---

## TAREA 1: Integrar API Gamificación (US-AE-005)

**Estimación:** 2-3 días
**Prioridad:** P0 - CRÍTICA
**Archivos a Modificar:** 5
**Archivos a Crear:** 3

### 1.1 Crear DTOs de Frontend

**Archivo:** `apps/frontend/src/types/admin/gamification.types.ts`

**Acción:** Crear nuevo archivo

**Contenido:**

```typescript
// apps/frontend/src/types/admin/gamification.types.ts

export interface GamificationParameter {
  id: string;
  category: 'points' | 'coins' | 'levels' | 'ranks' | 'penalties' | 'bonuses';
  key: string;
  value: number;
  defaultValue: number;
  minValue: number | null;
  maxValue: number | null;
  description: string;
  dataType: 'integer' | 'decimal' | 'percentage';
  isActive: boolean;
  lastModified: string;
  modifiedBy: string | null;
}

export interface MayaRank {
  id: string;
  name: string;
  level: number;
  minXp: number;
  maxXp: number | null;
  multiplierXp: number;
  multiplierMlCoins: number;
  bonusMlCoins: number;
  color: string;
  icon: string | null;
  description: string;
  perks: string[];
  isActive: boolean;
  order: number;
}

export interface GamificationStats {
  totalParameters: number;
  activeParameters: number;
  totalRanks: number;
  activeRanks: number;
  lastModified: string;
}

export interface UpdateParameterDto {
  value: number;
  reason?: string;
}

export interface BulkUpdateParametersDto {
  updates: Array<{
    key: string;
    value: number;
  }>;
  reason?: string;
}

export interface UpdateMayaRankDto {
  minXp?: number;
  maxXp?: number | null;
  multiplierXp?: number;
  multiplierMlCoins?: number;
  bonusMlCoins?: number;
  color?: string;
  description?: string;
  perks?: string[];
  isActive?: boolean;
}

export interface PreviewImpactDto {
  key: string;
  newValue: number;
}

export interface ImpactPreview {
  parameter: GamificationParameter;
  affected: {
    totalUsers: number;
    estimatedXpChange: number;
    estimatedCoinsChange: number;
    affectedRanks: string[];
  };
  recommendations: string[];
}

export interface ListParametersQuery {
  category?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
```

**Estimación:** 30 minutos

---

### 1.2 Crear API Client para Gamificación

**Archivo:** `apps/frontend/src/services/api/admin/gamificationConfigApi.ts`

**Acción:** Crear nuevo archivo

**Contenido:**

```typescript
// apps/frontend/src/services/api/admin/gamificationConfigApi.ts

import { apiClient } from '../apiClient';
import type {
  GamificationParameter,
  MayaRank,
  GamificationStats,
  UpdateParameterDto,
  BulkUpdateParametersDto,
  UpdateMayaRankDto,
  PreviewImpactDto,
  ImpactPreview,
  ListParametersQuery,
} from '@/types/admin/gamification.types';

const BASE_URL = '/api/admin/gamification/config';

export const gamificationConfigApi = {
  // ========================================
  // PARAMETERS
  // ========================================

  /**
   * Lista todos los parámetros de gamificación
   */
  async listParameters(query?: ListParametersQuery): Promise<{
    data: GamificationParameter[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await apiClient.get(`${BASE_URL}/parameters`, {
      params: query,
    });
    return response.data;
  },

  /**
   * Obtiene un parámetro específico por key
   */
  async getParameter(key: string): Promise<GamificationParameter> {
    const response = await apiClient.get(`${BASE_URL}/parameters/${key}`);
    return response.data;
  },

  /**
   * Actualiza un parámetro
   */
  async updateParameter(
    key: string,
    data: UpdateParameterDto
  ): Promise<GamificationParameter> {
    const response = await apiClient.patch(
      `${BASE_URL}/parameters/${key}`,
      data
    );
    return response.data;
  },

  /**
   * Resetea un parámetro a su valor default
   */
  async resetParameter(key: string): Promise<GamificationParameter> {
    const response = await apiClient.post(
      `${BASE_URL}/parameters/${key}/reset`
    );
    return response.data;
  },

  /**
   * Actualización masiva de parámetros
   */
  async bulkUpdateParameters(
    data: BulkUpdateParametersDto
  ): Promise<{ updated: number; parameters: GamificationParameter[] }> {
    const response = await apiClient.post(
      `${BASE_URL}/parameters/bulk-update`,
      data
    );
    return response.data;
  },

  // ========================================
  // MAYA RANKS
  // ========================================

  /**
   * Lista todos los rangos Maya
   */
  async listMayaRanks(): Promise<MayaRank[]> {
    const response = await apiClient.get(`${BASE_URL}/maya-ranks`);
    return response.data;
  },

  /**
   * Obtiene un rango Maya específico
   */
  async getMayaRank(id: string): Promise<MayaRank> {
    const response = await apiClient.get(`${BASE_URL}/maya-ranks/${id}`);
    return response.data;
  },

  /**
   * Actualiza un rango Maya
   */
  async updateMayaRank(
    id: string,
    data: UpdateMayaRankDto
  ): Promise<MayaRank> {
    const response = await apiClient.patch(
      `${BASE_URL}/maya-ranks/${id}`,
      data
    );
    return response.data;
  },

  // ========================================
  // PREVIEW & STATS
  // ========================================

  /**
   * Preview del impacto de cambiar un parámetro
   */
  async previewImpact(data: PreviewImpactDto): Promise<ImpactPreview> {
    const response = await apiClient.post(`${BASE_URL}/preview-impact`, data);
    return response.data;
  },

  /**
   * Obtiene estadísticas generales de gamificación
   */
  async getStats(): Promise<GamificationStats> {
    const response = await apiClient.get(`${BASE_URL}/stats`);
    return response.data;
  },
};
```

**Estimación:** 1 hora

---

### 1.3 Crear Hook de React Query

**Archivo:** `apps/frontend/src/apps/admin/hooks/useGamificationConfig.ts`

**Acción:** Crear nuevo archivo

**Contenido:**

```typescript
// apps/frontend/src/apps/admin/hooks/useGamificationConfig.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamificationConfigApi } from '@/services/api/admin/gamificationConfigApi';
import type {
  ListParametersQuery,
  UpdateParameterDto,
  BulkUpdateParametersDto,
  UpdateMayaRankDto,
  PreviewImpactDto,
} from '@/types/admin/gamification.types';
import { toast } from 'react-hot-toast';

const QUERY_KEYS = {
  parameters: (query?: ListParametersQuery) => ['gamification', 'parameters', query],
  parameter: (key: string) => ['gamification', 'parameter', key],
  mayaRanks: () => ['gamification', 'maya-ranks'],
  mayaRank: (id: string) => ['gamification', 'maya-rank', id],
  stats: () => ['gamification', 'stats'],
};

export function useGamificationConfig() {
  const queryClient = useQueryClient();

  // ========================================
  // QUERIES
  // ========================================

  const useParameters = (query?: ListParametersQuery) => {
    return useQuery({
      queryKey: QUERY_KEYS.parameters(query),
      queryFn: () => gamificationConfigApi.listParameters(query),
      staleTime: 1000 * 60 * 5, // 5 minutos
    });
  };

  const useParameter = (key: string, enabled = true) => {
    return useQuery({
      queryKey: QUERY_KEYS.parameter(key),
      queryFn: () => gamificationConfigApi.getParameter(key),
      enabled,
    });
  };

  const useMayaRanks = () => {
    return useQuery({
      queryKey: QUERY_KEYS.mayaRanks(),
      queryFn: () => gamificationConfigApi.listMayaRanks(),
      staleTime: 1000 * 60 * 10, // 10 minutos
    });
  };

  const useMayaRank = (id: string, enabled = true) => {
    return useQuery({
      queryKey: QUERY_KEYS.mayaRank(id),
      queryFn: () => gamificationConfigApi.getMayaRank(id),
      enabled,
    });
  };

  const useStats = () => {
    return useQuery({
      queryKey: QUERY_KEYS.stats(),
      queryFn: () => gamificationConfigApi.getStats(),
      staleTime: 1000 * 60 * 2, // 2 minutos
    });
  };

  // ========================================
  // MUTATIONS
  // ========================================

  const updateParameter = useMutation({
    mutationFn: ({ key, data }: { key: string; data: UpdateParameterDto }) =>
      gamificationConfigApi.updateParameter(key, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parameters() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parameter(variables.key) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats() });
      toast.success('Parámetro actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al actualizar parámetro');
    },
  });

  const resetParameter = useMutation({
    mutationFn: (key: string) => gamificationConfigApi.resetParameter(key),
    onSuccess: (_, key) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parameters() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parameter(key) });
      toast.success('Parámetro reseteado a valor por defecto');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al resetear parámetro');
    },
  });

  const bulkUpdateParameters = useMutation({
    mutationFn: (data: BulkUpdateParametersDto) =>
      gamificationConfigApi.bulkUpdateParameters(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parameters() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats() });
      toast.success('Parámetros actualizados en masa correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error en actualización masiva');
    },
  });

  const updateMayaRank = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMayaRankDto }) =>
      gamificationConfigApi.updateMayaRank(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mayaRanks() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mayaRank(variables.id) });
      toast.success('Rango Maya actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al actualizar rango');
    },
  });

  const previewImpact = useMutation({
    mutationFn: (data: PreviewImpactDto) =>
      gamificationConfigApi.previewImpact(data),
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al generar preview');
    },
  });

  return {
    // Queries
    useParameters,
    useParameter,
    useMayaRanks,
    useMayaRank,
    useStats,
    // Mutations
    updateParameter,
    resetParameter,
    bulkUpdateParameters,
    updateMayaRank,
    previewImpact,
  };
}
```

**Estimación:** 1.5 horas

---

### 1.4 Refactorizar AdminGamificationPage

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx`

**Acción:** Modificar archivo existente

**Cambios:**

1. **Eliminar datos hardcoded (líneas 38-71)**
2. **Integrar hook useGamificationConfig**
3. **Crear componentes internos para cada sección**

**Código Completo Refactorizado:**

```typescript
// apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { useUserGamification } from '@/shared/hooks/useUserGamification';
import { useGamificationConfig } from '../hooks/useGamificationConfig';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/Tabs';
import { Loader2, Settings, TrendingUp, Award, Coins } from 'lucide-react';

// Sub-componentes
import { ParametersTab } from '../components/gamification/ParametersTab';
import { MayaRanksTab } from '../components/gamification/MayaRanksTab';
import { AchievementsTab } from '../components/gamification/AchievementsTab';
import { EconomyStatsTab } from '../components/gamification/EconomyStatsTab';

export default function AdminGamificationPage() {
  const { user } = useAuth();
  const gamificationData = useUserGamification(user?.id);
  const [activeTab, setActiveTab] = useState('parameters');

  const {
    useParameters,
    useMayaRanks,
    useStats,
  } = useGamificationConfig();

  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: parametersData, isLoading: parametersLoading } = useParameters();
  const { data: mayaRanks, isLoading: ranksLoading } = useMayaRanks();

  const isLoading = statsLoading || parametersLoading || ranksLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Cargando configuración de gamificación...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuración de Gamificación</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona parámetros, rangos Maya, achievements y economía de ML Coins
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Última modificación: {stats?.lastModified ? new Date(stats.lastModified).toLocaleString() : 'N/A'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Parámetros Totales</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalParameters || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeParameters || 0} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rangos Maya</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRanks || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeRanks || 0} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20</div>
            <p className="text-xs text-muted-foreground">
              Configuración estática
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Economía ML Coins</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Activa</div>
            <p className="text-xs text-muted-foreground">
              Sistema v2.3.0
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="parameters">Parámetros</TabsTrigger>
          <TabsTrigger value="maya-ranks">Rangos Maya</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="economy">Economía</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="space-y-4">
          <ParametersTab
            parameters={parametersData?.data || []}
            total={parametersData?.total || 0}
          />
        </TabsContent>

        <TabsContent value="maya-ranks" className="space-y-4">
          <MayaRanksTab ranks={mayaRanks || []} />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <AchievementsTab />
        </TabsContent>

        <TabsContent value="economy" className="space-y-4">
          <EconomyStatsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**Estimación:** 2 horas

---

### 1.5 Crear Componente ParametersTab

**Archivo:** `apps/frontend/src/apps/admin/components/gamification/ParametersTab.tsx`

**Acción:** Crear nuevo archivo

**Contenido:**

```typescript
// apps/frontend/src/apps/admin/components/gamification/ParametersTab.tsx

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/Table';
import { useGamificationConfig } from '../../hooks/useGamificationConfig';
import type { GamificationParameter } from '@/types/admin/gamification.types';
import { Edit, RotateCcw, Eye } from 'lucide-react';

// Modal de edición
import { EditParameterModal } from './EditParameterModal';
import { PreviewImpactModal } from './PreviewImpactModal';

interface ParametersTabProps {
  parameters: GamificationParameter[];
  total: number;
}

export function ParametersTab({ parameters, total }: ParametersTabProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingParameter, setEditingParameter] = useState<GamificationParameter | null>(null);
  const [previewingParameter, setPreviewingParameter] = useState<GamificationParameter | null>(null);

  const { resetParameter } = useGamificationConfig();

  const filteredParameters = parameters.filter((param) => {
    const matchesCategory = categoryFilter === 'all' || param.category === categoryFilter;
    const matchesSearch =
      searchQuery === '' ||
      param.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      param.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleReset = (key: string) => {
    if (confirm('¿Estás seguro de resetear este parámetro a su valor por defecto?')) {
      resetParameter.mutate(key);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Parámetros de Gamificación ({total})</CardTitle>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="points">Puntos</SelectItem>
                  <SelectItem value="coins">Monedas</SelectItem>
                  <SelectItem value="levels">Niveles</SelectItem>
                  <SelectItem value="ranks">Rangos</SelectItem>
                  <SelectItem value="penalties">Penalizaciones</SelectItem>
                  <SelectItem value="bonuses">Bonificaciones</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Buscar parámetro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[250px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parámetro</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Valor Actual</TableHead>
                <TableHead>Valor Default</TableHead>
                <TableHead>Rango</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParameters.map((param) => (
                <TableRow key={param.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{param.key}</div>
                      <div className="text-sm text-muted-foreground">
                        {param.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{param.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {param.value}
                      {param.dataType === 'percentage' && '%'}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {param.defaultValue}
                    {param.dataType === 'percentage' && '%'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {param.minValue !== null ? param.minValue : '∞'} -{' '}
                    {param.maxValue !== null ? param.maxValue : '∞'}
                  </TableCell>
                  <TableCell>
                    {param.isActive ? (
                      <Badge variant="success">Activo</Badge>
                    ) : (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPreviewingParameter(param)}
                        title="Preview impacto"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingParameter(param)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReset(param.key)}
                        disabled={param.value === param.defaultValue}
                        title="Resetear a default"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredParameters.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron parámetros con los filtros aplicados
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {editingParameter && (
        <EditParameterModal
          parameter={editingParameter}
          onClose={() => setEditingParameter(null)}
        />
      )}
      {previewingParameter && (
        <PreviewImpactModal
          parameter={previewingParameter}
          onClose={() => setPreviewingParameter(null)}
        />
      )}
    </>
  );
}
```

**Estimación:** 2 horas

---

### 1.6 Crear Modal de Edición

**Archivo:** `apps/frontend/src/apps/admin/components/gamification/EditParameterModal.tsx`

**Acción:** Crear nuevo archivo

**Contenido:**

```typescript
// apps/frontend/src/apps/admin/components/gamification/EditParameterModal.tsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/Dialog';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';
import { Textarea } from '@/shared/components/ui/Textarea';
import { useGamificationConfig } from '../../hooks/useGamificationConfig';
import type { GamificationParameter } from '@/types/admin/gamification.types';

interface EditParameterModalProps {
  parameter: GamificationParameter;
  onClose: () => void;
}

export function EditParameterModal({ parameter, onClose }: EditParameterModalProps) {
  const [value, setValue] = useState(parameter.value.toString());
  const [reason, setReason] = useState('');
  const { updateParameter } = useGamificationConfig();

  const handleSubmit = () => {
    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      alert('Valor inválido');
      return;
    }

    if (parameter.minValue !== null && numValue < parameter.minValue) {
      alert(`El valor debe ser mayor o igual a ${parameter.minValue}`);
      return;
    }

    if (parameter.maxValue !== null && numValue > parameter.maxValue) {
      alert(`El valor debe ser menor o igual a ${parameter.maxValue}`);
      return;
    }

    updateParameter.mutate(
      {
        key: parameter.key,
        data: {
          value: numValue,
          reason: reason || undefined,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Parámetro: {parameter.key}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {parameter.description}
            </p>
          </div>

          <div>
            <Label htmlFor="value">
              Nuevo Valor {parameter.dataType === 'percentage' && '(%)'}
            </Label>
            <Input
              id="value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              step={parameter.dataType === 'decimal' ? '0.01' : '1'}
              min={parameter.minValue ?? undefined}
              max={parameter.maxValue ?? undefined}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Valor actual: {parameter.value} | Default: {parameter.defaultValue}
              {parameter.minValue !== null || parameter.maxValue !== null ? (
                <> | Rango: {parameter.minValue ?? '∞'} - {parameter.maxValue ?? '∞'}</>
              ) : null}
            </p>
          </div>

          <div>
            <Label htmlFor="reason">Razón del Cambio (Opcional)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Ajuste para mejorar engagement de estudiantes..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={updateParameter.isPending}>
            {updateParameter.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Estimación:** 1.5 horas

---

### 1.7 Crear MayaRanksTab (Simplificado)

**Archivo:** `apps/frontend/src/apps/admin/components/gamification/MayaRanksTab.tsx`

**Acción:** Crear nuevo archivo

**Contenido Inicial:**

```typescript
// apps/frontend/src/apps/admin/components/gamification/MayaRanksTab.tsx

import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import type { MayaRank } from '@/types/admin/gamification.types';

interface MayaRanksTabProps {
  ranks: MayaRank[];
}

export function MayaRanksTab({ ranks }: MayaRanksTabProps) {
  const sortedRanks = [...ranks].sort((a, b) => a.level - b.level);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sortedRanks.map((rank) => (
        <Card key={rank.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span style={{ color: rank.color }}>{rank.icon || '🏛️'}</span>
                {rank.name}
              </CardTitle>
              <Badge variant={rank.isActive ? 'success' : 'secondary'}>
                Nivel {rank.level}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Rango XP:</span>{' '}
                <span className="font-semibold">
                  {rank.minXp.toLocaleString()} - {rank.maxXp ? rank.maxXp.toLocaleString() : '∞'} XP
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Multiplicador XP:</span>{' '}
                <span className="font-semibold">{rank.multiplierXp}x</span>
              </div>
              <div>
                <span className="text-muted-foreground">Multiplicador ML Coins:</span>{' '}
                <span className="font-semibold">{rank.multiplierMlCoins}x</span>
              </div>
              <div>
                <span className="text-muted-foreground">Bonus ML Coins:</span>{' '}
                <span className="font-semibold">+{rank.bonusMlCoins} ML</span>
              </div>
              <div className="pt-2">
                <p className="text-muted-foreground text-xs">{rank.description}</p>
              </div>
              {rank.perks.length > 0 && (
                <div className="pt-2">
                  <span className="text-muted-foreground text-xs">Beneficios:</span>
                  <ul className="text-xs list-disc list-inside mt-1">
                    {rank.perks.map((perk, idx) => (
                      <li key={idx}>{perk}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

**Estimación:** 1 hora

---

### 1.8 Testing de Integración

**Checklist de Validación:**

```bash
# 1. Verificar que endpoints responden
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/admin/gamification/config/parameters

# 2. Verificar que frontend consume API
# - Abrir AdminGamificationPage
# - Verificar en Network tab que llama a:
#   - GET /api/admin/gamification/config/parameters
#   - GET /api/admin/gamification/config/maya-ranks
#   - GET /api/admin/gamification/config/stats

# 3. Probar edición de parámetro
# - Click en botón "Editar" de un parámetro
# - Cambiar valor
# - Guardar
# - Verificar que:
#   - Se hace PATCH a /api/admin/gamification/config/parameters/:key
#   - Se muestra toast de éxito
#   - La tabla se actualiza con nuevo valor

# 4. Probar reset de parámetro
# - Click en botón "Reset" de un parámetro modificado
# - Confirmar
# - Verificar que:
#   - Se hace POST a /api/admin/gamification/config/parameters/:key/reset
#   - Valor vuelve a defaultValue

# 5. Validar que NO hay datos hardcoded
grep -r "const mayaRanks = \[" apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx
# Debe retornar 0 resultados
```

**Estimación Testing:** 2 horas

---

### Resumen Tarea 1

| Subtarea | Estimación | Archivos |
|----------|------------|----------|
| 1.1 DTOs | 30 min | 1 nuevo |
| 1.2 API Client | 1 hora | 1 nuevo |
| 1.3 Hook | 1.5 horas | 1 nuevo |
| 1.4 Refactor Page | 2 horas | 1 modificado |
| 1.5 ParametersTab | 2 horas | 1 nuevo |
| 1.6 Modal Edición | 1.5 horas | 1 nuevo |
| 1.7 MayaRanksTab | 1 hora | 1 nuevo |
| 1.8 Testing | 2 horas | - |
| **TOTAL** | **11.5 horas** | **~2 días** |

---

## TAREA 2: Crear Seeds de Assignments

**Estimación:** 4 horas
**Prioridad:** P0 - CRÍTICA
**Archivos a Crear:** 1

### 2.1 Crear Archivo de Seed

**Archivo:** `apps/database/seeds/prod/educational_content/05-assignments.sql`

**Acción:** Crear nuevo archivo

**Contenido:**

```sql
-- apps/database/seeds/prod/educational_content/05-assignments.sql
-- =====================================================
-- ASSIGNMENTS PARA DEMO
-- Versión: 1.0
-- Fecha: 2025-11-23
-- Propósito: Datos de ejemplo de asignaciones de ejercicios
-- =====================================================

-- =====================================================
-- PREREQUISITOS
-- =====================================================
-- Este seed asume que ya existen:
-- 1. Classrooms (de 02-classrooms.sql)
-- 2. Exercises (de 02-exercises-module1.sql, 03-exercises-module2.sql, 04-exercises-module3.sql)
-- 3. Teachers (de 01-demo-users.sql)
-- 4. Students (de 01-demo-users.sql)

-- =====================================================
-- LIMPIAR DATOS EXISTENTES (SOLO DEMO)
-- =====================================================
DELETE FROM educational_content.assignments WHERE created_by = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- =====================================================
-- ASSIGNMENTS PARA CLASSROOM: 5to A - Comprensión Lectora
-- =====================================================

-- Classroom ID: 'dddddddd-dddd-dddd-dddd-dddddddddddd'
-- Teacher ID: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' (teacher@gamilit.com)

-- Assignment 1: Crucigrama Científico (Módulo 1)
INSERT INTO educational_content.assignments (
  id,
  classroom_id,
  exercise_id,
  title,
  description,
  due_date,
  points,
  status,
  max_attempts,
  show_feedback,
  metadata,
  created_by,
  updated_by
) VALUES (
  'aaaaaaaa-0001-0000-0000-000000000001',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  (SELECT id FROM educational_content.exercises WHERE code = 'MOD1-EX1-CRUCIGRAMA' LIMIT 1),
  'Tarea 1: Crucigrama Científico - Marie Curie',
  'Completa el crucigrama con términos relacionados a la biografía de Marie Curie. Presta atención a las fechas y lugares mencionados en el texto.',
  NOW() + INTERVAL '7 days',
  100,
  'active',
  3,
  true,
  '{"difficulty": "easy", "module": 1, "exercise_number": 1}'::jsonb,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

-- Assignment 2: Línea de Tiempo (Módulo 1) - OVERDUE
INSERT INTO educational_content.assignments (
  id,
  classroom_id,
  exercise_id,
  title,
  description,
  due_date,
  points,
  status,
  max_attempts,
  show_feedback,
  metadata,
  created_by,
  updated_by
) VALUES (
  'aaaaaaaa-0001-0000-0000-000000000002',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  (SELECT id FROM educational_content.exercises WHERE code = 'MOD1-EX2-TIMELINE' LIMIT 1),
  'Tarea 2: Línea de Tiempo Histórica',
  'Ordena cronológicamente los eventos de la vida de Marie Curie utilizando la funcionalidad de arrastrar y soltar.',
  NOW() - INTERVAL '3 days',
  100,
  'overdue',
  3,
  true,
  '{"difficulty": "easy", "module": 1, "exercise_number": 2, "auto_graded": true}'::jsonb,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

-- Assignment 3: Completar Espacios (Módulo 1) - COMPLETED
INSERT INTO educational_content.assignments (
  id,
  classroom_id,
  exercise_id,
  title,
  description,
  due_date,
  points,
  status,
  max_attempts,
  show_feedback,
  metadata,
  created_by,
  updated_by
) VALUES (
  'aaaaaaaa-0001-0000-0000-000000000003',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  (SELECT id FROM educational_content.exercises WHERE code = 'MOD1-EX3-FILL-BLANKS' LIMIT 1),
  'Tarea 3: Completar Texto Biográfico',
  'Completa los espacios en blanco con palabras del banco de palabras proporcionado.',
  NOW() - INTERVAL '10 days',
  100,
  'completed',
  3,
  true,
  '{"difficulty": "easy", "module": 1, "exercise_number": 3}'::jsonb,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

-- Assignment 4: Detective Textual (Módulo 2) - ACTIVE
INSERT INTO educational_content.assignments (
  id,
  classroom_id,
  exercise_id,
  title,
  description,
  due_date,
  points,
  status,
  max_attempts,
  show_feedback,
  metadata,
  created_by,
  updated_by
) VALUES (
  'aaaaaaaa-0001-0000-0000-000000000004',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  (SELECT id FROM educational_content.exercises WHERE code = 'MOD2-EX1-DETECTIVE' LIMIT 1),
  'Tarea 4: Detective Textual - Inferencias',
  'Lee los fragmentos y selecciona la inferencia correcta. Recuerda que debes deducir información que no está explícita.',
  NOW() + INTERVAL '14 days',
  150,
  'active',
  2,
  true,
  '{"difficulty": "medium", "module": 2, "exercise_number": 1}'::jsonb,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

-- Assignment 5: Construcción de Hipótesis (Módulo 2) - PENDING
INSERT INTO educational_content.assignments (
  id,
  classroom_id,
  exercise_id,
  title,
  description,
  due_date,
  points,
  status,
  max_attempts,
  show_feedback,
  metadata,
  created_by,
  updated_by
) VALUES (
  'aaaaaaaa-0001-0000-0000-000000000005',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  (SELECT id FROM educational_content.exercises WHERE code = 'MOD2-EX2-HYPOTHESIS' LIMIT 1),
  'Tarea 5: Causa y Efecto - Hipótesis',
  'Conecta causas con sus consecuencias lógicas sobre las decisiones de Marie Curie. Disponible desde el próximo lunes.',
  NOW() + INTERVAL '21 days',
  150,
  'pending',
  3,
  false,
  '{"difficulty": "medium", "module": 2, "exercise_number": 2, "unlocks_at": "2025-12-02T00:00:00Z"}'::jsonb,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

-- =====================================================
-- ASSIGNMENTS PARA CLASSROOM: 5to B - Lectura Digital
-- =====================================================

-- Classroom ID: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'

-- Assignment 6: Verdadero o Falso (Módulo 1)
INSERT INTO educational_content.assignments (
  id,
  classroom_id,
  exercise_id,
  title,
  description,
  due_date,
  points,
  status,
  max_attempts,
  show_feedback,
  metadata,
  created_by,
  updated_by
) VALUES (
  'aaaaaaaa-0001-0000-0000-000000000006',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  (SELECT id FROM educational_content.exercises WHERE code = 'MOD1-EX4-TRUE-FALSE' LIMIT 1),
  'Evaluación: Verdadero o Falso',
  'Determina si las afirmaciones sobre Marie Curie son verdaderas o falsas basándote en el texto.',
  NOW() + INTERVAL '5 days',
  100,
  'active',
  2,
  true,
  '{"difficulty": "easy", "module": 1, "exercise_number": 4, "is_evaluation": true}'::jsonb,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

-- Assignment 7: Tribunal de Opiniones (Módulo 3)
INSERT INTO educational_content.assignments (
  id,
  classroom_id,
  exercise_id,
  title,
  description,
  due_date,
  points,
  status,
  max_attempts,
  show_feedback,
  metadata,
  created_by,
  updated_by
) VALUES (
  'aaaaaaaa-0001-0000-0000-000000000007',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  (SELECT id FROM educational_content.exercises WHERE code = 'MOD3-EX1-TRIBUNAL' LIMIT 1),
  'Proyecto: Tribunal de Opiniones',
  'Clasifica afirmaciones sobre Marie Curie según estén bien fundamentadas o no. Usa pensamiento crítico.',
  NOW() + INTERVAL '20 days',
  200,
  'active',
  1,
  true,
  '{"difficulty": "hard", "module": 3, "exercise_number": 1, "is_project": true}'::jsonb,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

-- =====================================================
-- ASSIGNMENTS PARA CLASSROOM: 6to A - Producción de Textos
-- =====================================================

-- Classroom ID: 'ffffffff-ffff-ffff-ffff-ffffffffffff'

-- Assignment 8: Debate Digital (Módulo 3)
INSERT INTO educational_content.assignments (
  id,
  classroom_id,
  exercise_id,
  title,
  description,
  due_date,
  points,
  status,
  max_attempts,
  show_feedback,
  metadata,
  created_by,
  updated_by
) VALUES (
  'aaaaaaaa-0001-0000-0000-000000000008',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  (SELECT id FROM educational_content.exercises WHERE code = 'MOD3-EX2-DEBATE' LIMIT 1),
  'Debate: Fama y Ciencia',
  '¿La fama afectó negativamente la investigación de Marie Curie? Prepara argumentos a favor o en contra.',
  NOW() + INTERVAL '12 days',
  200,
  'active',
  1,
  true,
  '{"difficulty": "hard", "module": 3, "exercise_number": 2, "collaborative": true}'::jsonb,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

-- Assignment 9: Análisis de Fuentes (Módulo 3)
INSERT INTO educational_content.assignments (
  id,
  classroom_id,
  exercise_id,
  title,
  description,
  due_date,
  points,
  status,
  max_attempts,
  show_feedback,
  metadata,
  created_by,
  updated_by
) VALUES (
  'aaaaaaaa-0001-0000-0000-000000000009',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  (SELECT id FROM educational_content.exercises WHERE code = 'MOD3-EX3-SOURCES' LIMIT 1),
  'Investigación: Credibilidad de Fuentes',
  'Evalúa la credibilidad de diferentes fuentes sobre Marie Curie usando el método CRAAP.',
  NOW() + INTERVAL '18 days',
  200,
  'pending',
  2,
  true,
  '{"difficulty": "hard", "module": 3, "exercise_number": 3, "requires_research": true}'::jsonb,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

-- Assignment 10: Predicción Narrativa (Módulo 2) - EXTRA PARA 6to A
INSERT INTO educational_content.assignments (
  id,
  classroom_id,
  exercise_id,
  title,
  description,
  due_date,
  points,
  status,
  max_attempts,
  show_feedback,
  metadata,
  created_by,
  updated_by
) VALUES (
  'aaaaaaaa-0001-0000-0000-000000000010',
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  (SELECT id FROM educational_content.exercises WHERE code = 'MOD2-EX3-PREDICTION' LIMIT 1),
  'Actividad Extra: Predicción Narrativa',
  'Predice cómo continúa la historia basándote en el contexto histórico y social de la época.',
  NOW() + INTERVAL '30 days',
  150,
  'pending',
  3,
  false,
  '{"difficulty": "medium", "module": 2, "exercise_number": 3, "is_extra": true, "bonus_points": 50}'::jsonb,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

-- =====================================================
-- ASSIGNMENTS ADICIONALES PARA VARIEDAD
-- =====================================================

-- Assignment 11: Sopa de Letras BONUS (Módulo 1) - 5to A
INSERT INTO educational_content.assignments (
  id,
  classroom_id,
  exercise_id,
  title,
  description,
  due_date,
  points,
  status,
  max_attempts,
  show_feedback,
  metadata,
  created_by,
  updated_by
) VALUES (
  'aaaaaaaa-0001-0000-0000-000000000011',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  (SELECT id FROM educational_content.exercises WHERE code = 'MOD1-EX5-WORD-SEARCH' LIMIT 1),
  'Bonus: Sopa de Letras Científica',
  'Encuentra palabras relacionadas con Marie Curie en esta sopa de letras. Actividad opcional para ganar puntos extra.',
  NOW() + INTERVAL '10 days',
  50,
  'active',
  5,
  true,
  '{"difficulty": "easy", "module": 1, "exercise_number": 5, "is_bonus": true, "time_limit_minutes": 10}'::jsonb,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

-- Assignment 12: Puzzle de Contexto (Módulo 2) - 5to B
INSERT INTO educational_content.assignments (
  id,
  classroom_id,
  exercise_id,
  title,
  description,
  due_date,
  points,
  status,
  max_attempts,
  show_feedback,
  metadata,
  created_by,
  updated_by
) VALUES (
  'aaaaaaaa-0001-0000-0000-000000000012',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  (SELECT id FROM educational_content.exercises WHERE code = 'MOD2-EX4-PUZZLE' LIMIT 1),
  'Desafío: Puzzle de Contexto',
  'Ordena fragmentos de texto para crear una inferencia coherente sobre Marie Curie.',
  NOW() + INTERVAL '15 days',
  150,
  'active',
  3,
  true,
  '{"difficulty": "medium", "module": 2, "exercise_number": 4}'::jsonb,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
);

-- =====================================================
-- VALIDACIÓN
-- =====================================================

-- Verificar cantidad de assignments creados
SELECT
  c.name AS classroom,
  COUNT(a.id) AS total_assignments,
  COUNT(CASE WHEN a.status = 'active' THEN 1 END) AS active,
  COUNT(CASE WHEN a.status = 'pending' THEN 1 END) AS pending,
  COUNT(CASE WHEN a.status = 'completed' THEN 1 END) AS completed,
  COUNT(CASE WHEN a.status = 'overdue' THEN 1 END) AS overdue
FROM educational_content.assignments a
JOIN social_features.classrooms c ON a.classroom_id = c.id
WHERE a.created_by = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
GROUP BY c.id, c.name
ORDER BY c.name;

-- Resultado esperado:
-- 5to A - Comprensión Lectora: 6 assignments (2 active, 1 pending, 1 completed, 1 overdue, 1 bonus active)
-- 5to B - Lectura Digital: 3 assignments (2 active, 1 pending)
-- 6to A - Producción de Textos: 3 assignments (1 active, 2 pending)
-- TOTAL: 12 assignments

-- =====================================================
-- FIN DEL SEED
-- =====================================================
```

**Estimación:** 3 horas (incluyendo testing)

---

### 2.2 Aplicar Seed en Desarrollo

```bash
# 1. Navegar a carpeta de base de datos
cd apps/database

# 2. Aplicar seed
psql -U gamilit_user -d gamilit_platform -f seeds/prod/educational_content/05-assignments.sql

# 3. Verificar datos insertados
psql -U gamilit_user -d gamilit_platform -c "
SELECT
  COUNT(*) as total_assignments,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue
FROM educational_content.assignments
WHERE created_by = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
"

# Resultado esperado:
# total_assignments | active | pending | completed | overdue
# ------------------+--------+---------+-----------+---------
#                12 |      6 |       3 |         1 |       2
```

**Estimación:** 30 minutos

---

### 2.3 Validar en Frontend

```bash
# 1. Login como teacher@gamilit.com / Test1234

# 2. Ir a TeacherAssignmentsPage

# 3. Verificar que se muestran 12 assignments

# 4. Filtrar por classroom "5to A"
# - Debe mostrar 6 assignments

# 5. Verificar que status se muestran correctamente:
# - Active: botón "Ver Entregas"
# - Pending: badge "Próximamente"
# - Completed: badge "Completada"
# - Overdue: badge rojo "Vencida"
```

**Estimación:** 30 minutos

---

### Resumen Tarea 2

| Subtarea | Estimación |
|----------|------------|
| 2.1 Crear seed SQL | 3 horas |
| 2.2 Aplicar seed | 30 min |
| 2.3 Validar frontend | 30 min |
| **TOTAL** | **4 horas** |

---

## TAREA 3: Crear UI Asignaciones Classroom-Teacher (US-AE-007)

**Estimación:** 3-4 días
**Prioridad:** P1 - ALTA
**Archivos a Crear:** 6

### 3.1 Crear DTOs

**Archivo:** `apps/frontend/src/types/admin/classroom-teacher.types.ts`

**Acción:** Crear nuevo archivo

**Contenido:**

```typescript
// apps/frontend/src/types/admin/classroom-teacher.types.ts

export interface ClassroomTeacherAssignment {
  id: string;
  classroomId: string;
  teacherId: string;
  classroom: {
    id: string;
    name: string;
    grade: string;
    section: string;
    schoolId: string;
    schoolName: string;
  };
  teacher: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  assignedAt: string;
  assignedBy: string;
}

export interface AssignTeacherToClassroomDto {
  teacherId: string;
  metadata?: Record<string, any>;
}

export interface AssignClassroomsToTeacherDto {
  classroomIds: string[];
  metadata?: Record<string, any>;
}

export interface BulkAssignDto {
  assignments: Array<{
    classroomId: string;
    teacherId: string;
  }>;
}

export interface ClassroomWithTeachers {
  id: string;
  name: string;
  grade: string;
  section: string;
  teachers: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    assignedAt: string;
  }>;
  teachersCount: number;
}

export interface TeacherWithClassrooms {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  classrooms: Array<{
    id: string;
    name: string;
    grade: string;
    section: string;
    assignedAt: string;
  }>;
  classroomsCount: number;
}
```

**Estimación:** 30 minutos

---

### 3.2 Crear API Client

**Archivo:** `apps/frontend/src/services/api/admin/classroomTeacherApi.ts`

**Contenido:**

```typescript
// apps/frontend/src/services/api/admin/classroomTeacherApi.ts

import { apiClient } from '../apiClient';
import type {
  ClassroomTeacherAssignment,
  AssignTeacherToClassroomDto,
  AssignClassroomsToTeacherDto,
  BulkAssignDto,
  ClassroomWithTeachers,
  TeacherWithClassrooms,
} from '@/types/admin/classroom-teacher.types';

const BASE_URL = '/api/admin';

export const classroomTeacherApi = {
  /**
   * Obtiene teachers de un classroom
   */
  async getClassroomTeachers(classroomId: string): Promise<ClassroomWithTeachers> {
    const response = await apiClient.get(`${BASE_URL}/classrooms/${classroomId}/teachers`);
    return response.data;
  },

  /**
   * Asigna teacher a classroom
   */
  async assignTeacherToClassroom(
    classroomId: string,
    data: AssignTeacherToClassroomDto
  ): Promise<ClassroomTeacherAssignment> {
    const response = await apiClient.post(
      `${BASE_URL}/classrooms/${classroomId}/teachers`,
      data
    );
    return response.data;
  },

  /**
   * Remueve teacher de classroom
   */
  async removeTeacherFromClassroom(
    classroomId: string,
    teacherId: string
  ): Promise<void> {
    await apiClient.delete(`${BASE_URL}/classrooms/${classroomId}/teachers/${teacherId}`);
  },

  /**
   * Obtiene classrooms de un teacher
   */
  async getTeacherClassrooms(teacherId: string): Promise<TeacherWithClassrooms> {
    const response = await apiClient.get(`${BASE_URL}/teachers/${teacherId}/classrooms`);
    return response.data;
  },

  /**
   * Asigna classrooms a teacher
   */
  async assignClassroomsToTeacher(
    teacherId: string,
    data: AssignClassroomsToTeacherDto
  ): Promise<{ assigned: number }> {
    const response = await apiClient.post(
      `${BASE_URL}/teachers/${teacherId}/classrooms`,
      data
    );
    return response.data;
  },

  /**
   * Lista todas las asignaciones
   */
  async listAllAssignments(query?: {
    schoolId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: ClassroomTeacherAssignment[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await apiClient.get(`${BASE_URL}/classroom-teachers`, {
      params: query,
    });
    return response.data;
  },

  /**
   * Asignación masiva
   */
  async bulkAssign(data: BulkAssignDto): Promise<{ assigned: number }> {
    const response = await apiClient.post(
      `${BASE_URL}/classroom-teachers/bulk`,
      data
    );
    return response.data;
  },
};
```

**Estimación:** 1 hora

---

### 3.3 Crear Hook

**Archivo:** `apps/frontend/src/apps/admin/hooks/useClassroomTeacher.ts`

**Contenido:** (Similar a useGamificationConfig, con queries y mutations)

**Estimación:** 1.5 horas

---

### 3.4 Crear Página Principal

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminClassroomTeacherPage.tsx`

**Contenido:** Vista con tabs:
- Tab 1: Ver asignaciones por classroom
- Tab 2: Ver asignaciones por teacher
- Tab 3: Asignación masiva

**Estimación:** 3 horas

---

### 3.5 Crear Componentes

**Archivos:**
- `ClassroomTeachersTab.tsx` - Lista teachers por classroom
- `TeacherClassroomsTab.tsx` - Lista classrooms por teacher
- `BulkAssignTab.tsx` - Asignación masiva
- `AssignTeacherModal.tsx` - Modal para asignar teacher
- `RemoveTeacherConfirm.tsx` - Confirmación de remoción

**Estimación:** 8 horas (1.5 horas cada componente)

---

### 3.6 Testing

**Estimación:** 4 horas

---

### Resumen Tarea 3

| Subtarea | Estimación |
|----------|------------|
| 3.1 DTOs | 30 min |
| 3.2 API Client | 1 hora |
| 3.3 Hook | 1.5 horas |
| 3.4 Página Principal | 3 horas |
| 3.5 Componentes (5) | 8 horas |
| 3.6 Testing | 4 horas |
| **TOTAL** | **18 horas (~3 días)** |

---

## TAREA 4: Fix Gamification Data en Wrappers

**Estimación:** 4 horas
**Prioridad:** P1 - MEDIA
**Archivos a Modificar:** 4

### 4.1 TeacherStudentsPage

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherStudentsPage.tsx`

**Cambio:**

```typescript
// ANTES (líneas 17-24):
const gamificationData = {
  level: 5,
  xp: 3200,
  mlCoins: 850,
  rank: 'Ah K\'in',
};

// DESPUÉS:
const { user } = useAuth();
const gamificationData = useUserGamification(user?.id);
```

**Estimación:** 30 minutos

---

### 4.2 TeacherClassesPage

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherClassesPage.tsx`

**Cambio:** Igual que anterior

**Estimación:** 30 minutos

---

### 4.3 AdminInstitutionsPage

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminInstitutionsPage.tsx`

**Cambio:** (líneas 41-47)

**Estimación:** 30 minutos

---

### 4.4 AdminGamificationPage

**Archivo:** Ya corregido en Tarea 1

---

### 4.5 Testing

**Verificar:**
- Header muestra datos reales del usuario logueado
- Al cambiar de usuario, datos se actualizan
- Fallback funciona si API falla

**Estimación:** 2 horas

---

### Resumen Tarea 4

| Subtarea | Estimación |
|----------|------------|
| 4.1-4.3 Fix Wrappers (3 archivos) | 1.5 horas |
| 4.5 Testing | 2 horas |
| **TOTAL** | **3.5 horas** |

---

## VALIDACIÓN FINAL

### Checklist de Validación Completa

```markdown
## FRONTEND

### AdminGamificationPage
- [ ] NO hay arrays hardcoded de mayaRanks
- [ ] NO hay arrays hardcoded de achievements
- [ ] NO hay objetos hardcoded de economyStats
- [ ] Hace fetch a GET /api/admin/gamification/config/parameters
- [ ] Hace fetch a GET /api/admin/gamification/config/maya-ranks
- [ ] Hace fetch a GET /api/admin/gamification/config/stats
- [ ] Botón "Editar" abre modal funcional
- [ ] Modal de edición hace PATCH al endpoint correcto
- [ ] Toast de éxito se muestra al guardar
- [ ] Tabla se actualiza después de guardar
- [ ] Botón "Reset" hace POST al endpoint reset
- [ ] Preview impact funciona correctamente

### TeacherAssignmentsPage
- [ ] Muestra lista de assignments (>0 si seeds aplicados)
- [ ] Filtros por classroom funcionan
- [ ] Status badges se muestran correctamente
- [ ] Modal de crear assignment funciona
- [ ] Assignments se pueden editar
- [ ] Assignments se pueden eliminar

### AdminClassroomTeacherPage (si aplica)
- [ ] Tab "Por Classroom" muestra teachers asignados
- [ ] Tab "Por Teacher" muestra classrooms asignados
- [ ] Botón "Asignar Teacher" abre modal
- [ ] Asignación de teacher funciona
- [ ] Remoción de teacher funciona
- [ ] Asignación masiva funciona

### Wrappers
- [ ] TeacherStudentsPage usa useUserGamification (NO hardcoded)
- [ ] TeacherClassesPage usa useUserGamification (NO hardcoded)
- [ ] AdminInstitutionsPage usa useUserGamification (NO hardcoded)
- [ ] Gamification data se actualiza al cambiar usuario

## BACKEND

- [ ] Endpoints de gamificación responden correctamente
- [ ] Endpoints de classroom-teacher responden correctamente
- [ ] NO hay console.logs de debug en producción
- [ ] Audit logging funciona (updated_by, updated_at)

## BASE DE DATOS

- [ ] Seeds de assignments existen y funcionan
- [ ] 12 assignments insertados correctamente
- [ ] Assignments tienen classrooms válidos
- [ ] Assignments tienen exercises válidos
- [ ] Fechas de vencimiento son coherentes

## TESTS

- [ ] Tests unitarios de hooks pasan
- [ ] Tests de integración API pasan
- [ ] Tests E2E críticos pasan
- [ ] Coverage mínimo alcanzado (>70%)

## PERFORMANCE

- [ ] Página AdminGamificationPage carga en <2 segundos
- [ ] NO hay queries N+1
- [ ] React Query cachea correctamente
- [ ] NO hay memory leaks

## DOCUMENTACIÓN

- [ ] README actualizado con nuevas funcionalidades
- [ ] Comentarios en código complejo
- [ ] DTOs documentados con JSDoc
- [ ] Changelog actualizado
```

---

## CHECKLIST DE ENTREGA

### Pre-Commit

```bash
# 1. Linting
npm run lint

# 2. Format
npm run format

# 3. Type-check
npm run type-check

# 4. Tests
npm run test

# 5. Build
npm run build
```

### Git Workflow

```bash
# 1. Crear branch
git checkout -b feature/integrate-admin-teacher-apis

# 2. Commits atómicos
git add apps/frontend/src/types/admin/gamification.types.ts
git commit -m "feat(admin): add gamification DTOs"

git add apps/frontend/src/services/api/admin/gamificationConfigApi.ts
git commit -m "feat(admin): add gamification API client"

git add apps/frontend/src/apps/admin/hooks/useGamificationConfig.ts
git commit -m "feat(admin): add gamification React Query hook"

# ... etc para cada archivo

# 3. Push
git push origin feature/integrate-admin-teacher-apis

# 4. Crear PR
gh pr create --title "feat: Integrar APIs reales en portales Admin y Teacher" \
  --body "$(cat <<'EOF'
## Resumen
Integración de APIs reales en portales Admin y Teacher, completando US-AE-005 y US-AE-007.

## Cambios
- ✅ Integrada API de Gamificación (US-AE-005)
- ✅ Creados seeds de assignments
- ✅ Integrada UI de asignaciones classroom-teacher (US-AE-007)
- ✅ Corregidos gamification data en wrappers

## Tests
- Todos los tests unitarios pasan
- Tests de integración OK
- Validación manual completada

## Checklist
- [x] Linting OK
- [x] Type-check OK
- [x] Build OK
- [x] Tests OK
- [x] Documentación actualizada

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## ESTIMACIÓN FINAL CONSOLIDADA

| Tarea | Estimación | Prioridad |
|-------|------------|-----------|
| **Tarea 1: API Gamificación** | 2 días | P0 |
| **Tarea 2: Seeds Assignments** | 4 horas | P0 |
| **Tarea 3: UI Classroom-Teacher** | 3 días | P1 |
| **Tarea 4: Fix Wrappers** | 4 horas | P1 |
| **Testing y Validación** | 1 día | P0 |
| **TOTAL** | **6-7 días** | - |

### Desglose por Prioridad

**P0 (MVP Bloqueante):** 3-4 días
- Tarea 1: API Gamificación (2 días)
- Tarea 2: Seeds Assignments (4 horas)
- Testing P0 (4 horas)

**P1 (Importante):** 3-4 días
- Tarea 3: UI Classroom-Teacher (3 días)
- Tarea 4: Fix Wrappers (4 horas)
- Testing P1 (4 horas)

---

## CONTACTOS Y ESCALAMIENTO

**Si encuentras problemas:**

1. **Endpoints Backend no funcionan:**
   - Verificar que backend esté corriendo
   - Revisar logs de NestJS
   - Contactar a Backend-Developer

2. **Queries SQL fallan:**
   - Verificar que seeds previos están aplicados
   - Revisar integridad referencial
   - Contactar a Database-Developer

3. **Componentes UI no renderan:**
   - Verificar que librerías UI están instaladas
   - Revisar imports
   - Contactar a Frontend Lead

4. **Dudas arquitectónicas:**
   - Consultar con Architecture-Analyst
   - Revisar documentación en `docs/`

---

**FIN DEL PLAN DETALLADO**

**Versión:** 1.0
**Fecha:** 2025-11-23
**Mantenido por:** Architecture-Analyst
**Próxima Revisión:** Post-implementación
