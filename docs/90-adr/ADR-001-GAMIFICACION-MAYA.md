# ADR-001: Sistema de Gamificacion con Tematica de Cultura Maya

**Fecha:** 2025-08-15
**Estado:** Aceptada
**Autor:** Equipo GAMILIT

---

## Contexto

GAMILIT necesita un sistema de gamificacion que motive a los estudiantes K-12 a completar ejercicios de comprension lectora de forma sostenida. El sistema debe diferenciarse de soluciones genericas y conectar con la identidad cultural de la region.

### Problemas identificados:
- Los ejercicios de lectura tradicionales tienen baja tasa de engagement
- Los sistemas de gamificacion genericos (estrellas, puntos simples) pierden novelty rapidamente
- Se necesita un tema cultural relevante que genere identidad y orgullo

---

## Decision

Implementar un sistema de gamificacion completo inspirado en la jerarquia social y cultural de la civilizacion maya clasica, que incluye:

1. **Rangos jerarquicos maya** (5 niveles): Ah K'in -> Nacom -> Batab -> Halach Uinik -> Ajaw
2. **Economia virtual con ML Coins** (Maya Literacy Coins) en lugar de moneda generica
3. **Iconografia maya** para avatares, insignias y elementos visuales
4. **Sistema de XP con multiplicadores** inspirado en el sistema numeral maya
5. **Misiones tematicas** relacionadas con cultura maya

### Componentes del sistema:
- **XP Engine:** Puntos con multiplicadores por dificultad, racha y calidad
- **Rank System:** 5 rangos con thresholds de XP, beneficios progresivos
- **Achievement Engine:** Logros academicos, sociales, de consistencia y secretos
- **Virtual Economy:** ML Coins como moneda, tienda con items tematicos
- **Mission System:** Misiones diarias/semanales con recompensas
- **Leaderboards:** Rankings multi-nivel (aula, escuela, global) con temporadas

---

## Consecuencias

### Positivas
- Diferenciacion clara frente a competidores con gamificacion generica
- Conexion cultural que genera identificacion en estudiantes de la region
- Sistema profundo que mantiene engagement a largo plazo (no solo puntos)
- La economia virtual incentiva participacion diaria (misiones + tienda)
- Los leaderboards con temporadas previenen "desmoralizacion" de estudiantes nuevos

### Negativas
- Mayor complejidad de desarrollo (6 subsistemas interconectados)
- Requiere diseno grafico especializado para iconografia maya
- Balance de economia virtual requiere ajustes continuos (inflacion/deflacion)
- Riesgo de que la gamificacion distraiga del objetivo educativo si no se calibra

### Mitigaciones
- Parametros de gamificacion configurables por admin (ajustes sin deploy)
- XP vinculado directamente a calidad de respuesta (no solo completar)
- Limites diarios de XP para prevenir abuse y gaming del sistema
- Feature flags por tenant para activar/desactivar subsistemas

---

## Alternativas Consideradas

### 1. Gamificacion generica (estrellas, badges simples)
- **Rechazada:** Baja diferenciacion, pierde novelty en 2-4 semanas

### 2. Sin gamificacion (plataforma academica pura)
- **Rechazada:** Datos muestran 40-60% menor retention sin gamificacion

### 3. Gamificacion con tema de ciencia ficcion
- **Rechazada:** No conecta con identidad cultural de la region

### 4. Gamificacion con multiples temas seleccionables
- **Rechazada:** Complejidad excesiva para MVP, se podria agregar post-MVP

---

*ADR-001 - Aceptada*
