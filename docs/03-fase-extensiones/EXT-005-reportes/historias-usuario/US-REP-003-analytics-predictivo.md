# US-REP-003: Analytics Predictivo con Machine Learning

## Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | US-REP-003 |
| **Épica** | EXT-005 - Reportes Avanzados |
| **Título** | Sistema de Predicciones y Alertas Tempranas con ML |
| **Prioridad** | Media (P2) |
| **Story Points** | 10 SP |
| **Estado** | NOT STARTED |
| **Fase** | Mes 3 (Extensiones Primera Ola) |
| **Presupuesto** | $5,000 MXN |

---

## Historia de Usuario

**Como** profesor o administrador
**Quiero** predicciones basadas en ML sobre estudiantes en riesgo, proyecciones de completación y recomendaciones personalizadas
**Para** intervenir proactivamente, mejorar resultados académicos y prevenir abandono

---

## Valor de Negocio

### Impacto
- **Retención**: Predicción temprana reduce churn 30-40%
- **Resultados**: Intervenciones tempranas mejoran scores 15-25%
- **Eficiencia**: Profesores focalizan esfuerzo en estudiantes que lo necesitan
- **Diferenciación**: ML en educación es feature premium

### Métricas de Éxito
- Precisión de predicciones >80% (F1-score)
- >70% de estudiantes en riesgo identificados correctamente
- Intervenciones basadas en ML reducen abandono 35%
- Profesores usan predicciones en >60% de decisiones

---

## Criterios de Aceptación

### CA-01: Predicción de Estudiantes en Riesgo
**Dado** que el profesor accede a analytics
**Cuando** visualiza predicciones de riesgo
**Entonces** debe ver:
- **Lista de Estudiantes en Riesgo**:
  - Nombre, avatar, nivel de riesgo (Alto, Medio, Bajo)
  - Probabilidad de abandono: "78% de probabilidad de abandonar en 2 semanas"
  - Factores de riesgo identificados:
    - Baja frecuencia de login (no accede hace 5+ días)
    - Scores decrecientes (tendencia negativa)
    - Racha rota recientemente
    - Bajo engagement (pocas mecánicas completadas)
    - No responde mensajes de profesor
  - Recomendaciones automáticas de intervención
- **Indicadores Visuales**:
  - Semáforo: Rojo (Alto), Amarillo (Medio), Verde (Bajo)
  - Icono de alerta en tarjeta de estudiante
- **Filtros**: Todos / Solo alto riesgo / Solo medio riesgo
- **Ordenar por**: Nivel de riesgo / Probabilidad / Nombre

### CA-02: Proyección de Completación de Curso
**Dado** que el profesor quiere anticipar resultados
**Cuando** visualiza proyecciones
**Entonces** debe ver:
- **Proyección Individual por Estudiante**:
  - "Ana completará el curso en ~35 días (estimado: 15 de diciembre)"
  - Probabilidad de completar: "85%"
  - Ritmo actual vs ritmo requerido:
    - Actual: 2.5 mecánicas/semana
    - Requerido para meta: 4 mecánicas/semana
  - Gráfico de proyección (línea de tiempo)
- **Proyección de Grupo**:
  - % de aula que completará en tiempo: "68%"
  - % que necesita soporte adicional: "25%"
  - % en riesgo de no completar: "7%"
- **Alertas**:
  - "3 estudiantes van atrasados y necesitan acelerar"
  - "5 estudiantes van adelantados"

### CA-03: Tendencias de Rendimiento
**Dado** que el profesor monitorea evolución
**Cuando** accede a análisis de tendencias
**Entonces** debe ver:
- **Clasificación de Estudiantes**:
  - **Mejorando** (tendencia positiva en últimas 10 mecánicas)
    - Gráfico de score ascendente
    - % de mejora: "+15% vs promedio anterior"
  - **Estable** (variación <5%)
    - Gráfico horizontal
  - **Declinando** (tendencia negativa)
    - Gráfico descendente
    - Alerta: "Requiere atención"
- **Detección de Patrones**:
  - "Carlos tiene mejor rendimiento los lunes y martes"
  - "María estudia más en horarios nocturnos"
  - "Juan mejora cuando usa ayuda de 'eliminar opciones'"
- **Predicción de Score Futuro**:
  - "Si mantiene ritmo actual, score final proyectado: 78%"
  - "Necesita mejorar +10% para alcanzar meta de 85%"

### CA-04: Alertas Tempranas Automáticas
**Dado** que el sistema detecta situaciones de riesgo
**Cuando** ocurren eventos predictivos
**Entonces** debe generar:
- **Alertas para Profesores**:
  - "Ana no ha accedido en 7 días (riesgo alto de abandono)"
  - "Carlos tiene 5 mecánicas seguidas con score <60% (requiere intervención)"
  - "María rompió racha de 30 días (posible desmotivación)"
  - "3 estudiantes de Aula 1 muestran patrón de desenganche"
- **Prioridad de Alertas**:
  - Crítica (rojo): Acción inmediata requerida
  - Alta (naranja): Revisar en 24-48h
  - Media (amarillo): Monitorear
- **Canales de Notificación**:
  - In-app (dashboard)
  - Email diario (resumen)
  - Push notification (solo críticas)
- **Histórico de Alertas**:
  - Log de alertas pasadas
  - Acciones tomadas
  - Resultados de intervenciones

### CA-05: Recomendaciones Personalizadas de Intervención
**Dado** que el profesor necesita actuar
**Cuando** selecciona un estudiante en riesgo
**Entonces** debe recibir:
- **Recomendaciones Automáticas**:
  - "Enviar mensaje de motivación (efectividad: 72%)"
  - "Asignar mecánica de repaso de Módulo 2 (área débil detectada)"
  - "Ofrecer sesión 1:1 (recomendado para alto riesgo)"
  - "Sugerir formación de grupo de estudio con compañeros fuertes"
- **Templates de Mensajes**:
  - Mensaje pre-redactado basado en situación
  - Personalizable antes de enviar
  - Trackear efectividad (¿estudiante respondió? ¿mejoró?)
- **Recursos Sugeridos**:
  - Videos tutoriales específicos
  - Mecánicas de refuerzo
  - Material complementario
- **Historial de Intervenciones**:
  - Qué acciones se tomaron anteriormente
  - Qué funcionó / no funcionó

### CA-06: Identificación de Patrones de Aprendizaje
**Dado** que el ML analiza comportamientos
**Cuando** genera insights
**Entonces** debe identificar:
- **Patrones Temporales**:
  - Mejores días/horarios de estudio por estudiante
  - Momentos de mayor/menor concentración
  - Curvas de fatiga (rendimiento baja después de N mecánicas seguidas)
- **Patrones de Mecánicas**:
  - Tipos de ejercicios donde estudiante destaca
  - Tipos donde tiene dificultad
  - Secuencias óptimas de aprendizaje
- **Patrones Sociales**:
  - Impacto de estudiar con amigos (sube/baja score)
  - Efecto de competencia en leaderboard
- **Estilos de Aprendizaje**:
  - Visual (mejor con diagramas)
  - Auditivo (mejor con videos)
  - Kinestésico (mejor con interactivos)
  - Lectura/Escritura (mejor con texto)
- Visualización de patrones con heatmaps, grafos

### CA-07: Modelo de Machine Learning
**Dado** que se necesita predicciones precisas
**Cuando** el sistema entrena modelo
**Entonces** debe:
- **Features del Modelo**:
  - Frecuencia de login (últimos 7, 14, 30 días)
  - Scores promedio (general, por módulo, tendencia)
  - Mecánicas completadas (total, rate, variación)
  - Racha actual y máxima
  - Tiempo promedio por mecánica
  - Uso de ayudas (frecuencia, efectividad)
  - Interacciones sociales (mensajes, amigos)
  - Progreso vs cronograma
  - Edad, grado, institución (opcional)
- **Algoritmo**:
  - Random Forest o Gradient Boosting (XGBoost)
  - Regresión logística para clasificación binaria (en riesgo sí/no)
  - LSTM para series temporales (proyección de scores)
- **Entrenamiento**:
  - Datos históricos: mínimo 1000 estudiantes, 6 meses de datos
  - Split: 70% training, 15% validation, 15% test
  - Cross-validation para evitar overfitting
  - Re-entrenamiento mensual con nuevos datos

### CA-08: Dashboard de Predicciones para Profesores
**Dado** que profesores acceden a ML insights
**Cuando** visualizan dashboard
**Entonces** debe mostrar:
- **Vista General**:
  - Total de estudiantes en riesgo (por nivel)
  - Alertas pendientes de revisar
  - Tendencia de riesgo (aumentando/disminuyendo)
- **Lista de Estudiantes**:
  - Tabla con todos los estudiantes
  - Columnas: Nombre, Riesgo, Tendencia, Última actividad
  - Click para ver detalles y recomendaciones
- **Gráficos**:
  - Distribución de niveles de riesgo (pie chart)
  - Evolución de riesgo en el tiempo (line chart)
  - Heatmap de engagement por día/hora
- **Acciones Rápidas**:
  - "Enviar mensaje a todos los de alto riesgo"
  - "Generar reporte de intervenciones"
  - "Exportar lista de riesgo a Excel"

### CA-09: API de Predicciones
**Dado** que otros sistemas pueden consumir predicciones
**Cuando** llaman a API
**Entonces** deben recibir:
- **Endpoints**:
  ```typescript
  GET /api/ml/students/:id/risk-prediction
  GET /api/ml/students/:id/completion-projection
  GET /api/ml/students/:id/score-trend
  GET /api/ml/students/:id/recommendations
  GET /api/ml/classroom/:id/risk-summary
  ```
- **Respuesta JSON**:
  ```json
  {
    "studentId": "uuid",
    "riskLevel": "high",
    "probability": 0.78,
    "factors": [
      { "factor": "low_login_frequency", "impact": 0.45 },
      { "factor": "declining_scores", "impact": 0.33 }
    ],
    "recommendations": [
      { "action": "send_message", "template": "motivation_1", "priority": "high" }
    ],
    "updatedAt": "2025-11-02T10:30:00Z"
  }
  ```
- **Autenticación**: Bearer token
- **Rate limiting**: 1000 requests/hora
- **Documentación**: Swagger/OpenAPI

### CA-10: Explicabilidad del Modelo (XAI)
**Dado** que las predicciones deben ser confiables
**Cuando** se muestra una predicción
**Entonces** debe incluir:
- **Feature Importance**:
  - Factores que más contribuyen a la predicción
  - "45% por baja frecuencia de login, 33% por scores decrecientes"
- **SHAP Values** (opcional avanzado):
  - Explicación visual de contribución de cada feature
- **Confianza del Modelo**:
  - "Confianza: 85% (basado en 500 casos similares)"
- **Casos Similares**:
  - "Estudiantes con patrón similar tuvieron X% de abandono"
- Transparencia para generar confianza en profesores

### CA-11: Evaluación y Monitoreo del Modelo
**Dado** que el modelo debe ser preciso
**Cuando** se evalúa performance
**Entonces** debe trackear:
- **Métricas de Clasificación**:
  - Precision, Recall, F1-score
  - Matriz de confusión
  - AUC-ROC curve
- **Métricas de Negocio**:
  - % de estudiantes salvados por intervención temprana
  - Reducción de churn vs baseline
  - Satisfacción de profesores con predicciones
- **Drift Detection**:
  - Detectar si distribución de datos cambia
  - Alertar si modelo pierde precisión
  - Re-entrenar automáticamente si drift detectado
- **A/B Testing**:
  - Comparar versiones de modelo
  - Medir impacto de recomendaciones

### CA-12: Cron Jobs de Entrenamiento
**Dado** que el modelo necesita actualizarse
**Cuando** se ejecuta job programado
**Entonces** debe:
- **Frecuencia**: Mensual (o semanal si volumen alto)
- **Pipeline**:
  1. Extraer datos nuevos desde data warehouse
  2. Pre-procesamiento y feature engineering
  3. Entrenar modelo con datos actualizados
  4. Evaluar en test set
  5. Si mejora >2% vs modelo actual, deploy
  6. Si no, mantener modelo anterior
- **Notificación**:
  - Email a data scientist si entrenamiento falla
  - Dashboard de status de modelos
- **Versionamiento**:
  - Guardar modelos históricos (últimos 6)
  - Rollback si modelo nuevo falla en producción

### CA-13: Seguridad y Privacidad
**Dado** que se usan datos sensibles de estudiantes
**Cuando** el ML procesa datos
**Entonces** debe:
- **Anonimización**:
  - Remover PII antes de entrenar modelo
  - Usar IDs encriptados
- **GDPR Compliance**:
  - Derecho al olvido (remover datos de entrenamiento)
  - Opt-out de predicciones (si estudiante no quiere)
- **Acceso Controlado**:
  - Solo profesores ven predicciones de sus estudiantes
  - Admins ven datos agregados (no individuales)
- **Audit Trail**:
  - Log de quién accede a predicciones
  - Qué acciones toman basadas en predicciones

### CA-14: Integración con Sistema de Notificaciones
**Dado** que alertas deben llegar a profesores
**Cuando** ML detecta riesgo alto
**Entonces** debe:
- Crear notificación en sistema (ver EXT-003)
- Enviar email si configurado
- Push notification en app mobile
- Resumen diario/semanal de alertas
- Configuración de preferencias:
  - Frecuencia de notificaciones
  - Niveles de riesgo que activan alerta
  - Canales preferidos

### CA-15: Feedback Loop
**Dado** que el modelo aprende de resultados
**Cuando** profesores toman acciones
**Entonces** el sistema debe:
- **Capturar Outcomes**:
  - ¿Estudiante mejoró después de intervención?
  - ¿Predicción fue correcta?
  - ¿Qué acción se tomó?
- **Actualizar Modelo**:
  - Incorporar feedback en próximo entrenamiento
  - Ajustar pesos de features que funcionan mejor
- **Mejorar Recomendaciones**:
  - Recomendar acciones que históricamente funcionan
  - Evitar acciones inefectivas

---

## Especificaciones Técnicas

### ML Pipeline
```
ml-service/
├── data/
│   ├── extract.py (extrae datos de data warehouse)
│   ├── transform.py (feature engineering)
│   └── load.py (carga datos procesados)
├── models/
│   ├── risk_predictor.py (clasificación de riesgo)
│   ├── completion_projector.py (proyección de completación)
│   ├── score_forecaster.py (pronóstico de scores)
│   └── recommendation_engine.py (motor de recomendaciones)
├── training/
│   ├── train.py
│   ├── evaluate.py
│   └── hyperparameter_tuning.py
├── serving/
│   ├── api.py (FastAPI endpoints)
│   └── predictor.py (inferencia)
├── monitoring/
│   ├── drift_detector.py
│   └── performance_tracker.py
└── utils/
    ├── feature_engineering.py
    └── explainability.py (SHAP, LIME)
```

### Technology Stack
```
ML:
- Python 3.10+
- scikit-learn para modelos clásicos
- XGBoost para gradient boosting
- TensorFlow/PyTorch para deep learning (si necesario)
- SHAP para explicabilidad
- MLflow para tracking de experimentos
- Optuna para hyperparameter tuning

Data:
- Pandas para manipulación
- NumPy para cálculos
- PostgreSQL para datos
- ClickHouse para analytics (opcional)

API:
- FastAPI para serving de predicciones
- Celery para jobs asíncronos
- Redis para cache de predicciones

Deployment:
- Docker containers
- Kubernetes (opcional, para escalar)
- GitHub Actions para CI/CD
- Model registry (MLflow o S3)
```

### TypeScript Interfaces (Frontend)
```typescript
interface RiskPrediction {
  studentId: string;
  riskLevel: 'low' | 'medium' | 'high';
  probability: number; // 0-1
  factors: RiskFactor[];
  recommendations: Recommendation[];
  confidence: number; // 0-1
  updatedAt: Date;
}

interface RiskFactor {
  factor: string;
  impact: number; // 0-1
  description: string;
}

interface Recommendation {
  action: string;
  template?: string;
  priority: 'low' | 'medium' | 'high';
  effectiveness: number; // 0-1 (basado en historial)
}

interface CompletionProjection {
  studentId: string;
  estimatedCompletionDate: Date;
  probability: number; // 0-1
  currentPace: number; // mecánicas/semana
  requiredPace: number;
  onTrack: boolean;
}

interface ScoreTrend {
  studentId: string;
  trend: 'improving' | 'stable' | 'declining';
  trendPercentage: number; // +15% o -10%
  projectedFinalScore: number;
  recentScores: number[]; // últimos 10
}
```

---

## Diferenciación con Alcance Inicial (EAI)

### Alcance Inicial (EAI)
- **EP003/US-003-30**: Analytics básico de aprendizaje
- Estadísticas descriptivas (promedios, gráficos)
- Sin predicciones, sin ML

### Esta Historia (EXT-005)
- **Machine Learning completo**
- **Predicción de riesgo de abandono**
- **Proyecciones de completación**
- **Detección de tendencias**
- **Alertas tempranas automáticas**
- **Recomendaciones personalizadas**
- **Explicabilidad de predicciones**
- **Pipeline de ML con re-entrenamiento**
- Esto es **analytics predictivo vs descriptivo**

---

## Dependencias

### Depende de
- **US-REP-004**: Data warehouse (fuente de datos)
- **US-REP-001**: Analytics de profesor (consumidor de predicciones)
- **EXT-003**: Sistema de notificaciones (alertas)
- **EAI-001 a EAI-010**: Datos de todos los módulos

### Bloquea a
- Ninguna (feature independiente)

---

## Definición de Terminado (DoD)

- [ ] Pipeline ETL para extraer features
- [ ] Feature engineering (20+ features)
- [ ] Modelo de predicción de riesgo (F1 >0.8)
- [ ] Modelo de proyección de completación
- [ ] Modelo de tendencias de score
- [ ] Motor de recomendaciones
- [ ] FastAPI para serving de predicciones
- [ ] Dashboard de predicciones para profesores
- [ ] Sistema de alertas tempranas
- [ ] Explicabilidad de modelos (SHAP)
- [ ] Cron job de re-entrenamiento mensual
- [ ] Monitoreo de drift y performance
- [ ] API documentada (Swagger)
- [ ] Tests de modelos (>0.8 F1-score en test set)
- [ ] Tests de API
- [ ] Documentación de pipeline ML
- [ ] Guía de uso para profesores
- [ ] Dashboard de monitoreo de modelos

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Modelo con baja precisión | Media | Alto | Más features, más datos, tuning exhaustivo |
| Datos insuficientes para entrenar | Media | Crítico | Usar datos sintéticos inicialmente, esperar 3-6 meses |
| Predicciones sesgadas | Media | Alto | Fairness testing, balanceo de clases, auditoría |
| Profesores no confían en ML | Alta | Medio | Explicabilidad, transparencia, UX simple |
| Latencia en predicciones | Baja | Medio | Cache de predicciones, pre-cómputo nocturno |

---

## Estimación Detallada (10 SP)

| Tarea | Horas | Responsable |
|-------|-------|-------------|
| Diseño de features | 8h | Data Scientist |
| ETL pipeline | 10h | Backend Dev |
| Feature engineering | 10h | Data Scientist |
| Entrenamiento modelo riesgo | 16h | Data Scientist |
| Entrenamiento modelo proyección | 12h | Data Scientist |
| Motor de recomendaciones | 10h | Data Scientist |
| FastAPI serving | 10h | Backend Dev |
| Dashboard predicciones (Frontend) | 12h | Frontend Dev |
| Sistema de alertas | 8h | Backend Dev |
| Explicabilidad (SHAP) | 8h | Data Scientist |
| Cron jobs | 6h | Backend Dev |
| Monitoreo y drift | 8h | Data Scientist |
| Testing | 12h | QA + DS |
| Documentación | 6h | Tech Lead |
| **TOTAL** | **136h** | |

**Presupuesto**: $5,000 MXN (~$285 USD)
**Duración Estimada**: 3-4 días (equipo de 6-7 personas incluyendo Data Scientist)

---

## Tags

#ext-005 #machine-learning #predicciones #analytics #alertas #riesgo #recomendaciones #ml #ai #mes-3

---

**Creado**: 2025-11-02
**Última Actualización**: 2025-11-02
**Autor**: Sistema de Migración - Subagente EXT 4-6
**Estado**: Pendiente de Aprobación
**Versión**: 1.0
**Origen**: EP003/US-003-30-analytics-aprendizaje.md (sección de predicciones extraída)
**Compliance**: PF-001 (XXX líneas)
