# Machine Learning Integration Guide

## Overview

Este documento describe cómo integrar modelos de Machine Learning reales en el sistema de Student Insights de GAMILIT.

**Estado Actual**: Sistema usa heurísticas (reglas simples)
**Objetivo**: Migrar a modelos ML entrenados para predicciones más precisas

## Tabla de Contenidos

1. [Arquitectura Actual](#arquitectura-actual)
2. [Interfaces Definidas](#interfaces-definidas)
3. [Opciones de Integración](#opciones-de-integración)
4. [Guía de Implementación](#guía-de-implementación)
5. [Testing y Validación](#testing-y-validación)
6. [Despliegue](#despliegue)

---

## Arquitectura Actual

### Sistema Heurístico (Placeholder)

```
┌─────────────────────┐
│  AnalyticsService   │
│                     │
│  getStudentInsights │
└──────────┬──────────┘
           │
           │ (usa heurísticas)
           │
           ▼
┌─────────────────────┐
│ MLPredictorService  │
│   (Heurístico)      │
│                     │
│ - predictCompletion │
│ - predictDropoutRisk│
│ - predictRiskLevel  │
└─────────────────────┘
```

### Arquitectura Objetivo (con ML Real)

```
┌─────────────────────┐
│  AnalyticsService   │
│                     │
│  getStudentInsights │
└──────────┬──────────┘
           │
           │ (inyección de dependencia)
           │
           ▼
┌─────────────────────┐      ┌──────────────────┐
│ PythonMLPredictor   │─────►│ Python ML Service│
│   (HTTP/gRPC)       │      │  (FastAPI/Flask) │
└─────────────────────┘      │                  │
                              │ - Trained Models │
                              │ - Feature Eng    │
                              │ - Preprocessing  │
                              └──────────────────┘
```

---

## Interfaces Definidas

### 1. `IMLPredictor`

Interfaz principal para servicios de predicción ML.

```typescript
interface IMLPredictor {
  predictCompletion(studentData: StudentMLInput): Promise<number>;
  predictDropoutRisk(studentData: StudentMLInput): Promise<number>;
  predictRiskLevel(studentData: StudentMLInput): Promise<'low' | 'medium' | 'high'>;
  getFeatureImportance(studentData: StudentMLInput): Promise<FeatureImportance[]>;
  getModelVersion(): string;
}
```

**Ubicación**: `src/modules/teacher/interfaces/ml-predictor.interface.ts`

### 2. `StudentMLInput`

Estructura de datos de entrada para modelos ML.

```typescript
interface StudentMLInput {
  // Performance metrics
  average_score: number;
  completed_exercises: number;
  total_exercises: number;
  completed_modules: number;
  total_modules: number;

  // Engagement metrics
  current_streak_days: number;
  longest_streak_days: number;
  total_time_spent_minutes: number;
  avg_time_per_exercise: number;

  // Struggle indicators
  struggle_areas_count: number;
  avg_struggle_success_rate: number;

  // Class comparison
  score_percentile: number;
  exercises_percentile: number;

  // Temporal
  days_since_last_activity: number;
  account_age_days: number;

  // Optional: historical data
  score_trend?: number[];
  activity_trend?: number[];
}
```

### 3. `FeatureImportance`

Información sobre importancia de características (explainability).

```typescript
interface FeatureImportance {
  feature_name: string;
  importance: number; // 0 to 1
  description: string;
}
```

---

## Opciones de Integración

### Opción 1: Python ML Microservice (Recomendada)

**Pros:**
- Ecosistema ML maduro (scikit-learn, TensorFlow, PyTorch)
- Fácil entrenamiento y experimentación
- Separación de concerns
- Escalabilidad independiente

**Cons:**
- Latencia de red adicional
- Requiere deployment adicional
- Complejidad operacional

**Stack Recomendado:**
- Python 3.10+
- FastAPI (API REST)
- Pydantic (validación)
- scikit-learn / XGBoost / LightGBM (modelos)
- MLflow (tracking de experimentos)
- Docker (containerización)

**Ejemplo de Implementación:**

```typescript
// apps/backend/src/modules/teacher/services/python-ml-predictor.service.ts

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { IMLPredictor, StudentMLInput, FeatureImportance } from '../interfaces';

@Injectable()
export class PythonMLPredictorService implements IMLPredictor {
  private readonly logger = new Logger(PythonMLPredictorService.name);
  private readonly mlServiceUrl: string;
  private readonly timeout: number;
  private readonly fallbackService: MLPredictorService; // Heuristic fallback

  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    this.timeout = parseInt(process.env.ML_SERVICE_TIMEOUT) || 5000;
  }

  async predictCompletion(input: StudentMLInput): Promise<number> {
    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/predict/completion`,
        input,
        { timeout: this.timeout }
      );

      this.logger.debug(
        `ML prediction: ${response.data.prediction} (confidence: ${response.data.confidence})`
      );

      return response.data.prediction;
    } catch (error) {
      this.logger.error(`ML service error: ${error.message}, falling back to heuristic`);
      return this.fallbackService.predictCompletion(input);
    }
  }

  async predictDropoutRisk(input: StudentMLInput): Promise<number> {
    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/predict/dropout`,
        input,
        { timeout: this.timeout }
      );
      return response.data.prediction;
    } catch (error) {
      this.logger.error(`ML service error, using fallback`);
      return this.fallbackService.predictDropoutRisk(input);
    }
  }

  async predictRiskLevel(input: StudentMLInput): Promise<'low' | 'medium' | 'high'> {
    const dropoutRisk = await this.predictDropoutRisk(input);
    if (dropoutRisk > 0.6) return 'high';
    if (dropoutRisk > 0.3) return 'medium';
    return 'low';
  }

  async getFeatureImportance(input: StudentMLInput): Promise<FeatureImportance[]> {
    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/feature-importance`,
        input,
        { timeout: this.timeout }
      );
      return response.data.features;
    } catch (error) {
      return this.fallbackService.getFeatureImportance(input);
    }
  }

  getModelVersion(): string {
    return process.env.ML_MODEL_VERSION || 'unknown';
  }
}
```

**Python Service (FastAPI):**

```python
# ml-service/main.py

from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI()

# Load trained models
completion_model = joblib.load('models/completion_model.pkl')
dropout_model = joblib.load('models/dropout_model.pkl')

class StudentInput(BaseModel):
    average_score: float
    completed_exercises: int
    total_exercises: int
    completed_modules: int
    total_modules: int
    current_streak_days: int
    longest_streak_days: int
    total_time_spent_minutes: float
    avg_time_per_exercise: float
    struggle_areas_count: int
    avg_struggle_success_rate: float
    score_percentile: float
    exercises_percentile: float
    days_since_last_activity: int
    account_age_days: int

@app.post("/predict/completion")
async def predict_completion(student: StudentInput):
    features = prepare_features(student)
    prediction = completion_model.predict_proba(features)[0][1]
    confidence = max(completion_model.predict_proba(features)[0])

    return {
        "prediction": float(prediction),
        "confidence": float(confidence),
        "model_version": "1.0.0"
    }

@app.post("/predict/dropout")
async def predict_dropout(student: StudentInput):
    features = prepare_features(student)
    prediction = dropout_model.predict_proba(features)[0][1]

    return {
        "prediction": float(prediction),
        "confidence": max(dropout_model.predict_proba(features)[0])
    }

@app.post("/feature-importance")
async def get_feature_importance(student: StudentInput):
    importances = completion_model.feature_importances_
    feature_names = [...]  # Feature names list

    features = [
        {
            "feature_name": name,
            "importance": float(imp),
            "description": feature_descriptions[name]
        }
        for name, imp in zip(feature_names, importances)
    ]

    return {"features": sorted(features, key=lambda x: x["importance"], reverse=True)}

def prepare_features(student: StudentInput) -> np.ndarray:
    """Convert StudentInput to numpy array for model"""
    return np.array([[
        student.average_score,
        student.completed_exercises / max(student.total_exercises, 1),
        student.completed_modules / max(student.total_modules, 1),
        student.current_streak_days,
        # ... more features
    ]])
```

---

### Opción 2: TensorFlow.js (Node.js)

**Pros:**
- Sin latencia de red
- Deployment más simple
- Mismo stack tecnológico

**Cons:**
- Limitaciones de TensorFlow.js vs Python
- Menor ecosistema ML
- Requiere convertir modelos

**Implementación:**

```typescript
import * as tf from '@tensorflow/tfjs-node';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IMLPredictor, StudentMLInput } from '../interfaces';

@Injectable()
export class TensorFlowJSPredictorService implements IMLPredictor, OnModuleInit {
  private readonly logger = new Logger(TensorFlowJSPredictorService.name);
  private completionModel: tf.LayersModel;
  private dropoutModel: tf.LayersModel;

  async onModuleInit() {
    this.logger.log('Loading TensorFlow.js models...');

    this.completionModel = await tf.loadLayersModel(
      'file://./ml-models/completion/model.json'
    );

    this.dropoutModel = await tf.loadLayersModel(
      'file://./ml-models/dropout/model.json'
    );

    this.logger.log('Models loaded successfully');
  }

  async predictCompletion(input: StudentMLInput): Promise<number> {
    const inputTensor = this.prepareInput(input);
    const prediction = this.completionModel.predict(inputTensor) as tf.Tensor;
    const value = (await prediction.data())[0];

    // Cleanup
    inputTensor.dispose();
    prediction.dispose();

    return value;
  }

  private prepareInput(input: StudentMLInput): tf.Tensor {
    const features = [
      input.average_score / 100,
      input.completed_modules / input.total_modules,
      input.current_streak_days / 30,
      // ... normalize all features
    ];

    return tf.tensor2d([features]);
  }

  // ... implement other methods
}
```

---

### Opción 3: Cloud ML Services

**AWS SageMaker, Azure ML, Google Cloud AI Platform**

**Pros:**
- Infraestructura managed
- Escalabilidad automática
- Monitoreo incluido

**Cons:**
- Costo
- Vendor lock-in
- Complejidad de setup

**Ejemplo (AWS SageMaker):**

```typescript
import * as AWS from 'aws-sdk';
import { Injectable, Logger } from '@nestjs/common';
import { IMLPredictor, StudentMLInput } from '../interfaces';

@Injectable()
export class AWSMLPredictorService implements IMLPredictor {
  private readonly logger = new Logger(AWSMLPredictorService.name);
  private readonly sagemakerRuntime: AWS.SageMakerRuntime;
  private readonly endpointName: string;

  constructor() {
    this.sagemakerRuntime = new AWS.SageMakerRuntime({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.endpointName = process.env.SAGEMAKER_ENDPOINT_NAME;
  }

  async predictCompletion(input: StudentMLInput): Promise<number> {
    const params = {
      EndpointName: this.endpointName,
      Body: JSON.stringify(input),
      ContentType: 'application/json',
      Accept: 'application/json',
    };

    try {
      const response = await this.sagemakerRuntime.invokeEndpoint(params).promise();
      const result = JSON.parse(response.Body.toString());
      return result.completion_probability;
    } catch (error) {
      this.logger.error(`SageMaker invocation error: ${error.message}`);
      throw error;
    }
  }

  // ... implement other methods
}
```

---

## Guía de Implementación

### Paso 1: Entrenamiento de Modelos (Python)

```python
# train_models.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, roc_auc_score
import joblib

# Load historical data
df = pd.read_csv('student_data.csv')

# Feature engineering
X = df[[
    'average_score',
    'completed_modules_ratio',
    'current_streak_days',
    'struggle_areas_count',
    # ... all features
]]

y_completion = df['completed_course']
y_dropout = df['dropped_out']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y_completion, test_size=0.2)

# Train model
model = RandomForestClassifier(n_estimators=100, max_depth=10)
model.fit(X_train, y_train)

# Evaluate
predictions = model.predict(X_test)
print(f"Accuracy: {accuracy_score(y_test, predictions)}")
print(f"AUC: {roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])}")

# Save model
joblib.dump(model, 'completion_model.pkl')
```

### Paso 2: Actualizar Module Providers

```typescript
// teacher.module.ts

import { Module } from '@nestjs/common';
import { PythonMLPredictorService } from './services/python-ml-predictor.service';
import { MLPredictorService } from './services/ml-predictor.service';

@Module({
  providers: [
    // Provide based on environment
    {
      provide: 'IMLPredictor',
      useClass: process.env.USE_ML === 'true'
        ? PythonMLPredictorService
        : MLPredictorService, // Fallback to heuristic
    },
  ],
})
export class TeacherModule {}
```

### Paso 3: Inject en AnalyticsService

```typescript
// analytics.service.ts

import { Inject } from '@nestjs/common';
import { IMLPredictor } from '../interfaces';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject('IMLPredictor') private readonly mlPredictor: IMLPredictor,
  ) {}

  // Use mlPredictor instead of hardcoded heuristics
}
```

---

## Testing y Validación

### Unit Tests

```typescript
describe('PythonMLPredictorService', () => {
  let service: PythonMLPredictorService;

  beforeEach(() => {
    // Mock axios
  });

  it('should predict completion probability', async () => {
    const input: StudentMLInput = {
      average_score: 75,
      completed_modules: 3,
      total_modules: 5,
      // ...
    };

    const result = await service.predictCompletion(input);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('should fallback to heuristic on ML service error', async () => {
    // Mock network error
    const result = await service.predictCompletion(input);
    expect(result).toBeDefined(); // Should not throw
  });
});
```

### Integration Tests

```typescript
describe('ML Service Integration', () => {
  it('should communicate with Python ML service', async () => {
    // Requires ML service running
    const response = await axios.post('http://localhost:8000/predict/completion', {
      // test data
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('prediction');
  });
});
```

### A/B Testing

Comparar predicciones ML vs heurísticas:

```typescript
const mlPrediction = await mlService.predictCompletion(input);
const heuristicPrediction = await heuristicService.predictCompletion(input);

logger.log(`ML: ${mlPrediction}, Heuristic: ${heuristicPrediction}, Diff: ${Math.abs(mlPrediction - heuristicPrediction)}`);
```

---

## Despliegue

### Docker Compose (Development)

```yaml
version: '3.8'

services:
  backend:
    build: ./apps/backend
    environment:
      - ML_SERVICE_URL=http://ml-service:8000
      - USE_ML=true
    depends_on:
      - ml-service

  ml-service:
    build: ./ml-service
    ports:
      - "8000:8000"
    volumes:
      - ./ml-service/models:/app/models
```

### Kubernetes (Production)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ml-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ml-service
  template:
    metadata:
      labels:
        app: ml-service
    spec:
      containers:
      - name: ml-service
        image: gamilit/ml-service:1.0.0
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
---
apiVersion: v1
kind: Service
metadata:
  name: ml-service
spec:
  selector:
    app: ml-service
  ports:
  - port: 8000
    targetPort: 8000
```

---

## Monitoreo y Observabilidad

### Metrics to Track

1. **Latency**: Tiempo de respuesta del servicio ML
2. **Error Rate**: % de fallos / fallbacks a heurísticas
3. **Prediction Distribution**: Distribución de predicciones
4. **Model Drift**: Cambios en distribución de features
5. **Accuracy**: Comparación predicciones vs outcomes reales

### Logging

```typescript
this.logger.log({
  event: 'ml_prediction',
  student_id: studentId,
  prediction: result,
  confidence: confidence,
  model_version: modelVersion,
  latency_ms: Date.now() - startTime,
});
```

---

## Próximos Pasos

1. ✅ **Interfaces Definidas** (Completo)
2. ⏳ **Recolectar Datos Históricos** (Siguiente)
3. ⏳ **Entrenar Modelos Iniciales**
4. ⏳ **Desplegar Python ML Service**
5. ⏳ **Implementar PythonMLPredictorService**
6. ⏳ **A/B Testing**
7. ⏳ **Migración Completa**

---

## Referencias

- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [AWS SageMaker SDK](https://docs.aws.amazon.com/sagemaker/)
- [MLflow Tracking](https://www.mlflow.org/docs/latest/tracking.html)
- [scikit-learn User Guide](https://scikit-learn.org/stable/user_guide.html)

---

## Contacto

Para dudas sobre integración ML, contactar al equipo de Data Science.
