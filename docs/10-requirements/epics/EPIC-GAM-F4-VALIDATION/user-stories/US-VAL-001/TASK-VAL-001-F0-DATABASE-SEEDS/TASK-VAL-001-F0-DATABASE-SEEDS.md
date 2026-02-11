# TASK-VAL-001-F0-DATABASE-SEEDS: Verificar seeds dev

**US:** US-VAL-001 | **Tipo:** Database | **Estado:** Pendiente | **SP:** 2

## Descripcion
Verificar que los datos seed de desarrollo se cargaron correctamente tras recrear la BD.

## Acciones
1. Verificar seeds auth (roles, permisos, usuario admin)
2. Verificar seeds gamification (ranks, achievements, missions)
3. Verificar seeds educational (ejercicios, categorias)
4. Contar registros por tabla principal

## Criterio Pass
- Datos de auth, gamification y educational presentes
- Conteos coinciden con los esperados
