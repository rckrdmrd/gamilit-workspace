# GUÍA DE CORRECCIÓN DE REFERENCIAS DOCUMENTACIÓN ↔ CÓDIGO

Esta guía proporciona ejemplos prácticos y scripts para corregir las referencias inválidas encontradas en el análisis.

---

## 📋 Tabla de Contenidos

1. [Script de Validación Rápida](#script-de-validación-rápida)
2. [Correcciones Comunes](#correcciones-comunes)
3. [Mapeo de Rutas](#mapeo-de-rutas)
4. [Implementación de Componentes Faltantes](#implementación-de-componentes-faltantes)

---

## 1. Script de Validación Rápida

### Uso en CI/CD

```bash
#!/bin/bash
# validate-doc-references.sh

echo "Validando referencias en documentación..."

python3 << 'PYTHON'
import os
import re
import sys

docs_dir = "docs"
apps_dir = "apps"
errors = []

def check_file_exists(file_path):
    return os.path.exists(file_path)

def extract_file_refs(content):
    patterns = [
        r"apps/([a-z_]+)/([a-zA-Z0-9/_.-]+\.(ts|tsx|js|jsx|sql|json))",
        r"`apps/([a-z_]+)/([a-zA-Z0-9/_.-]+\.(ts|tsx|js|jsx|sql|json))`",
    ]
    refs = []
    for pattern in patterns:
        matches = re.finditer(pattern, content)
        for match in matches:
            refs.append(f"apps/{match.group(1)}/{match.group(2)}")
    return refs

# Procesar archivos
invalid_count = 0
for root, dirs, files in os.walk(docs_dir):
    for file in files:
        if file.endswith('.md'):
            doc_path = os.path.join(root, file)
            with open(doc_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            refs = extract_file_refs(content)
            for ref in refs:
                if not check_file_exists(ref):
                    invalid_count += 1
                    errors.append(f"{doc_path}: {ref}")

if invalid_count > 0:
    print(f"❌ Encontradas {invalid_count} referencias inválidas:")
    for error in errors[:20]:  # Mostrar primeros 20
        print(f"  - {error}")
    sys.exit(1)
else:
    print("✅ Todas las referencias son válidas")
    sys.exit(0)
PYTHON
```

---

## 2. Correcciones Comunes

### 2.1 Backend - Estructura de Módulos

**❌ Incorrecto (en documentación):**
```
apps/backend/src/modules/gamification/services/achievement.service.ts
```

**✅ Correcto (verificar estructura real):**
```bash
# Verificar estructura real
find apps/backend/src -name "achievement.service.ts"

# Puede ser:
apps/backend/src/modules/achievements/achievement.service.ts
# o
apps/backend/src/services/achievement.service.ts
```

**Script de corrección automática:**
```bash
#!/bin/bash
# fix-backend-paths.sh

# Reemplazar rutas obsoletas
find docs -name "*.md" -type f -exec sed -i \
  's|apps/backend/src/modules/gamification/|apps/backend/src/modules/|g' {} +

find docs -name "*.md" -type f -exec sed -i \
  's|apps/backend/src/educational-content/|apps/backend/src/modules/content/|g' {} +

echo "✅ Rutas de backend actualizadas"
```

### 2.2 Frontend - Extensiones de Archivo

**❌ Incorrecto:**
```
apps/frontend/src/components/auth/RoleBasedRoute.tsx
```

**✅ Verificar si existe con extensión .ts:**
```bash
# Buscar archivo
find apps/frontend/src -name "RoleBasedRoute.*"

# Si existe como .ts, actualizar doc
```

### 2.3 Database - Funciones SQL

**❌ Referencia a función no implementada:**
```
apps/database/ddl/schemas/gamification_system/functions/check_rank_promotion.sql
```

**✅ Crear archivo o actualizar referencia:**
```sql
-- apps/database/ddl/schemas/gamification_system/functions/check_rank_promotion.sql
CREATE OR REPLACE FUNCTION gamification_system.check_rank_promotion(
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_xp INTEGER;
    v_current_rank TEXT;
    v_next_rank_threshold INTEGER;
BEGIN
    -- Implementación
    SELECT total_xp, current_rank INTO v_current_xp, v_current_rank
    FROM gamification_system.user_stats
    WHERE user_id = p_user_id;
    
    -- Lógica de promoción
    RETURN false; -- Placeholder
END;
$$;
```

---

## 3. Mapeo de Rutas

### 3.1 Tabla de Conversión de Rutas

| Documentación Antigua | Ruta Real | Estado |
|-----------------------|-----------|--------|
| `apps/backend/src/modules/gamification/services/` | `apps/backend/src/modules/*/` | Verificar |
| `apps/backend/src/educational-content/` | `apps/backend/src/modules/content/` | Verificar |
| `apps/backend/src/shared/enums/` | `apps/backend/src/shared/enums/` | ✅ OK |
| `apps/frontend/src/types/auth.types.ts` | `apps/frontend/src/shared/types/` | Verificar |
| `apps/frontend/src/components/auth/` | `apps/frontend/src/features/auth/components/` | Verificar |

### 3.2 Script de Mapeo Automático

```python
#!/usr/bin/env python3
# fix_paths.py

import os
import re

# Mapeo de rutas antiguas a nuevas
PATH_MAPPING = {
    r"apps/backend/src/modules/gamification/services/": "apps/backend/src/modules/gamification/",
    r"apps/backend/src/educational-content/": "apps/backend/src/modules/content/",
    r"apps/frontend/src/types/auth\.types\.ts": "apps/frontend/src/shared/types/auth.ts",
}

def fix_paths_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    for old_path, new_path in PATH_MAPPING.items():
        content = re.sub(old_path, new_path, content)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    
    return False

# Procesar archivos
docs_dir = "docs"
fixed_count = 0

for root, dirs, files in os.walk(docs_dir):
    for file in files:
        if file.endswith('.md'):
            file_path = os.path.join(root, file)
            if fix_paths_in_file(file_path):
                fixed_count += 1
                print(f"✅ Actualizado: {file_path}")

print(f"\n✅ Total archivos actualizados: {fixed_count}")
```

---

## 4. Implementación de Componentes Faltantes

### 4.1 Backend - Achievement Service (Ejemplo)

```typescript
// apps/backend/src/modules/gamification/services/achievement.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from '../entities/achievement.entity';
import { UserAchievement } from '../entities/user-achievement.entity';

@Injectable()
export class AchievementService {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepo: Repository<Achievement>,
    
    @InjectRepository(UserAchievement)
    private userAchievementRepo: Repository<UserAchievement>,
  ) {}

  async findAll(): Promise<Achievement[]> {
    return await this.achievementRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC' },
    });
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await this.userAchievementRepo.find({
      where: { userId },
      relations: ['achievement'],
      order: { unlockedAt: 'DESC' },
    });
  }

  async checkAndUnlock(userId: string, achievementCode: string): Promise<boolean> {
    // Llamar a función SQL
    const result = await this.achievementRepo.query(
      'SELECT gamification_system.check_and_unlock_achievement($1, $2) as unlocked',
      [userId, achievementCode]
    );
    
    return result[0]?.unlocked || false;
  }
}
```

### 4.2 Frontend - Type Definitions

```typescript
// apps/frontend/src/shared/types/auth.ts

export enum GamilitRole {
  STUDENT = 'student',
  ADMIN_TEACHER = 'admin_teacher',
  SUPER_ADMIN = 'super_admin',
}

export interface UserProfile {
  id: string;
  userId: string;
  role: GamilitRole;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

### 4.3 Database - Función SQL Faltante

```sql
-- apps/database/ddl/schemas/gamification_system/functions/award_achievement_rewards.sql

CREATE OR REPLACE FUNCTION gamification_system.award_achievement_rewards(
    p_user_achievement_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_xp_reward INTEGER;
    v_ml_coins_reward INTEGER;
BEGIN
    -- Obtener datos del achievement
    SELECT
        ua.user_id,
        a.xp_reward,
        a.ml_coins_reward
    INTO
        v_user_id,
        v_xp_reward,
        v_ml_coins_reward
    FROM gamification_system.user_achievements ua
    INNER JOIN gamification_system.achievements a ON ua.achievement_id = a.id
    WHERE ua.id = p_user_achievement_id;
    
    -- Otorgar XP
    IF v_xp_reward > 0 THEN
        UPDATE gamification_system.user_stats
        SET total_xp = total_xp + v_xp_reward,
            updated_at = NOW()
        WHERE user_id = v_user_id;
    END IF;
    
    -- Otorgar ML Coins
    IF v_ml_coins_reward > 0 THEN
        UPDATE gamification_system.user_stats
        SET ml_coins = ml_coins + v_ml_coins_reward,
            updated_at = NOW()
        WHERE user_id = v_user_id;
    END IF;
END;
$$;

COMMENT ON FUNCTION gamification_system.award_achievement_rewards IS 
'Otorga recompensas de XP y ML Coins al desbloquear achievement';
```

---

## 5. Checklist de Implementación

### Para cada componente faltante:

- [ ] **Verificar estructura de carpetas**
  ```bash
  tree apps/backend/src/modules -L 2
  tree apps/frontend/src -L 2
  ```

- [ ] **Crear archivo base**
  ```bash
  # Backend
  mkdir -p apps/backend/src/modules/gamification/services
  touch apps/backend/src/modules/gamification/services/achievement.service.ts
  
  # Frontend
  mkdir -p apps/frontend/src/shared/types
  touch apps/frontend/src/shared/types/auth.ts
  
  # Database
  mkdir -p apps/database/ddl/schemas/gamification_system/functions
  touch apps/database/ddl/schemas/gamification_system/functions/award_achievement_rewards.sql
  ```

- [ ] **Implementar funcionalidad básica**
  - Usar plantillas de la sección 4
  - Adaptar a necesidades específicas

- [ ] **Actualizar documentación**
  ```bash
  # Ejecutar script de validación
  ./validate-doc-references.sh
  ```

- [ ] **Commit y push**
  ```bash
  git add .
  git commit -m "feat: implement missing component XYZ
  
  - Add achievement service
  - Add auth types
  - Update documentation references
  
  Refs: INVENTARIO-REFERENCIAS-DOCS-CODIGO.md"
  git push
  ```

---

## 6. Comandos Útiles

### Encontrar todas las referencias a un archivo específico

```bash
# Buscar en documentación
grep -r "achievement.service.ts" docs/

# Buscar archivo en código
find apps -name "achievement.service.ts"

# Ver diferencias
diff <(grep -r "achievement.service.ts" docs/ | cut -d: -f2) \
     <(find apps -name "achievement.service.ts")
```

### Generar lista de archivos por crear

```bash
# Leer CSV de archivos faltantes y crear directorios
python3 << 'PYTHON'
import csv
import os

with open('archivos_faltantes.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        file_path = row['Archivo Faltante']
        dir_path = os.path.dirname(file_path)
        
        # Crear directorio si no existe
        os.makedirs(dir_path, exist_ok=True)
        
        # Crear archivo vacío con comentario
        if not os.path.exists(file_path):
            with open(file_path, 'w') as f:
                f.write(f"// TODO: Implement {os.path.basename(file_path)}\n")
            print(f"✅ Created: {file_path}")
PYTHON
```

---

## 7. Recursos Adicionales

### Documentación de Referencia
- [NestJS Best Practices](https://docs.nestjs.com/techniques/configuration)
- [TypeORM Entities](https://typeorm.io/entities)
- [React TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)

### Scripts de Ayuda
- `validate-doc-references.sh` - Validación de referencias
- `fix-backend-paths.sh` - Corrección de rutas backend
- `fix_paths.py` - Corrección automática de rutas

---

**Última actualización**: 2025-11-08  
**Mantenido por**: Equipo de Desarrollo GAMILIT
