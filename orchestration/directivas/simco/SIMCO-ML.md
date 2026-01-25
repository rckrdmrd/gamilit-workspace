# SIMCO: OPERACIONES ML/AI (Python/FastAPI)

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Aplica a:** Todo agente que trabaje con Machine Learning o integración de IA
**Prioridad:** OBLIGATORIA para operaciones ML/AI

---

## RESUMEN EJECUTIVO

> **Datos limpios + Modelo entrenado + API de inferencia + Métricas documentadas = ML completo.**

---

## PRINCIPIO FUNDAMENTAL

```
╔══════════════════════════════════════════════════════════════════════╗
║  CICLO ML REPRODUCIBLE                                               ║
║                                                                       ║
║  • Datos versionados (DVC o similar)                                 ║
║  • Experimentos rastreados (MLflow)                                  ║
║  • Modelos serializados con metadata                                 ║
║  • Métricas objetivo definidas ANTES de entrenar                     ║
║  • API de inferencia con validación de entrada/salida                ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## ESTRUCTURA DE PROYECTO ML

```
ml-service/
├── src/
│   ├── api/                      # FastAPI endpoints
│   │   ├── main.py               # Entry point
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── health.py         # Health checks
│   │   │   └── predict.py        # Inference endpoints
│   │   └── schemas/
│   │       ├── __init__.py
│   │       └── prediction.py     # Pydantic schemas
│   ├── models/                   # Definiciones de modelos
│   │   ├── __init__.py
│   │   ├── base.py               # Clase base modelo
│   │   └── {model_name}/
│   │       ├── __init__.py
│   │       ├── model.py          # Arquitectura
│   │       └── config.py         # Hiperparámetros
│   ├── pipelines/                # ETL y feature engineering
│   │   ├── __init__.py
│   │   ├── preprocessing.py
│   │   └── features.py
│   ├── training/                 # Scripts de entrenamiento
│   │   ├── __init__.py
│   │   ├── train.py
│   │   ├── evaluate.py
│   │   └── hyperparameter_search.py
│   ├── inference/                # Lógica de inferencia
│   │   ├── __init__.py
│   │   └── predictor.py
│   ├── llm/                      # Integración LLM (si aplica)
│   │   ├── __init__.py
│   │   ├── chains.py
│   │   ├── embeddings.py
│   │   └── prompts.py
│   └── utils/
│       ├── __init__.py
│       ├── logging.py
│       └── metrics.py
├── notebooks/                    # Jupyter notebooks
│   ├── 01_eda.ipynb
│   ├── 02_feature_engineering.ipynb
│   └── 03_model_experiments.ipynb
├── data/
│   ├── raw/                      # Datos originales (no modificar)
│   ├── processed/                # Datos procesados
│   └── models/                   # Modelos serializados
├── tests/
│   ├── __init__.py
│   ├── test_preprocessing.py
│   ├── test_model.py
│   └── test_api.py
├── mlflow/                       # MLflow tracking (local)
├── configs/
│   └── model_config.yaml         # Configuración del modelo
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── pyproject.toml
└── MODEL_CARD.md                 # Documentación del modelo
```

---

## CONVENCIONES DE NOMENCLATURA

### Archivos Python
```python
# Módulos: snake_case
data_preprocessing.py
feature_engineering.py
model_trainer.py

# Clases: PascalCase
class DataPreprocessor:
class FeatureExtractor:
class ModelTrainer:

# Funciones: snake_case con verbo
def load_data():
def preprocess_features():
def train_model():
def evaluate_metrics():

# Constantes: UPPER_SNAKE_CASE
MAX_SEQUENCE_LENGTH = 512
DEFAULT_BATCH_SIZE = 32
MODEL_VERSION = "1.0.0"
```

### Modelos y Artefactos
```
# Modelos serializados
model_v1.0.0_2025-12-08.pkl
model_v1.0.0_2025-12-08.pt
model_v1.0.0_2025-12-08.onnx

# Datasets procesados
train_features_v1.parquet
test_features_v1.parquet

# Configuraciones
hyperparams_experiment_001.yaml
```

---

## TEMPLATES

### FastAPI Main (Entry Point)

```python
# src/api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.api.routes import health, predict
from src.inference.predictor import ModelPredictor
from src.utils.logging import setup_logging

# Global predictor instance
predictor: ModelPredictor = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for model loading."""
    global predictor
    setup_logging()
    predictor = ModelPredictor()
    predictor.load_model()
    yield
    # Cleanup if needed

app = FastAPI(
    title="ML Service",
    description="Machine Learning inference API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(predict.router, prefix="/api/v1", tags=["Prediction"])
```

### Prediction Schema (Pydantic)

```python
# src/api/schemas/prediction.py
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class PredictionRequest(BaseModel):
    """Request schema for prediction endpoint."""

    features: List[float] = Field(
        ...,
        description="Input features for prediction",
        min_items=1,
        example=[0.5, 1.2, -0.3, 0.8]
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"features": [0.5, 1.2, -0.3, 0.8]}
            ]
        }
    }

class PredictionResponse(BaseModel):
    """Response schema for prediction endpoint."""

    prediction: float = Field(
        ...,
        description="Model prediction value"
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score (0-1)"
    )
    model_version: str = Field(
        ...,
        description="Version of the model used"
    )

class BatchPredictionRequest(BaseModel):
    """Request schema for batch predictions."""

    instances: List[List[float]] = Field(
        ...,
        description="Multiple instances for batch prediction"
    )

class BatchPredictionResponse(BaseModel):
    """Response schema for batch predictions."""

    predictions: List[PredictionResponse]
    total_instances: int
```

### Prediction Route

```python
# src/api/routes/predict.py
from fastapi import APIRouter, HTTPException, Depends
from src.api.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
)
from src.inference.predictor import ModelPredictor

router = APIRouter()

def get_predictor() -> ModelPredictor:
    """Dependency to get predictor instance."""
    from src.api.main import predictor
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return predictor

@router.post("/predict", response_model=PredictionResponse)
async def predict(
    request: PredictionRequest,
    predictor: ModelPredictor = Depends(get_predictor)
) -> PredictionResponse:
    """
    Generate prediction for input features.

    - **features**: List of numerical features
    - Returns prediction with confidence score
    """
    try:
        result = predictor.predict(request.features)
        return PredictionResponse(
            prediction=result["prediction"],
            confidence=result["confidence"],
            model_version=predictor.model_version
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@router.post("/predict/batch", response_model=BatchPredictionResponse)
async def predict_batch(
    request: BatchPredictionRequest,
    predictor: ModelPredictor = Depends(get_predictor)
) -> BatchPredictionResponse:
    """Generate predictions for multiple instances."""
    predictions = []
    for features in request.instances:
        result = predictor.predict(features)
        predictions.append(PredictionResponse(
            prediction=result["prediction"],
            confidence=result["confidence"],
            model_version=predictor.model_version
        ))
    return BatchPredictionResponse(
        predictions=predictions,
        total_instances=len(predictions)
    )
```

### Model Predictor

```python
# src/inference/predictor.py
import pickle
import numpy as np
from pathlib import Path
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class ModelPredictor:
    """
    Handles model loading and inference.

    Attributes:
        model: Loaded ML model
        model_version: Version string
        feature_names: List of expected features
    """

    def __init__(self, model_path: str = None):
        self.model = None
        self.model_version = "1.0.0"
        self.model_path = model_path or "data/models/model_latest.pkl"
        self.feature_names: List[str] = []

    def load_model(self) -> None:
        """Load model from disk."""
        path = Path(self.model_path)
        if not path.exists():
            raise FileNotFoundError(f"Model not found: {self.model_path}")

        logger.info(f"Loading model from {self.model_path}")
        with open(path, "rb") as f:
            artifact = pickle.load(f)

        self.model = artifact["model"]
        self.model_version = artifact.get("version", "unknown")
        self.feature_names = artifact.get("feature_names", [])
        logger.info(f"Model loaded: v{self.model_version}")

    def predict(self, features: List[float]) -> Dict[str, Any]:
        """
        Generate prediction for input features.

        Args:
            features: List of numerical features

        Returns:
            Dictionary with prediction and confidence
        """
        if self.model is None:
            raise RuntimeError("Model not loaded")

        X = np.array(features).reshape(1, -1)

        # Get prediction
        prediction = float(self.model.predict(X)[0])

        # Get confidence (if available)
        confidence = 1.0
        if hasattr(self.model, "predict_proba"):
            proba = self.model.predict_proba(X)[0]
            confidence = float(max(proba))

        return {
            "prediction": prediction,
            "confidence": confidence,
        }
```

### Training Script

```python
# src/training/train.py
import mlflow
import numpy as np
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    mean_squared_error, r2_score
)
import pickle
from pathlib import Path
from datetime import datetime
import logging
from typing import Any, Dict, Tuple

logger = logging.getLogger(__name__)

def train_model(
    X: np.ndarray,
    y: np.ndarray,
    model_class: Any,
    params: Dict[str, Any],
    experiment_name: str = "default",
    model_type: str = "classification"
) -> Tuple[Any, Dict[str, float]]:
    """
    Train and evaluate a model with MLflow tracking.

    Args:
        X: Feature matrix
        y: Target vector
        model_class: sklearn-compatible model class
        params: Model hyperparameters
        experiment_name: MLflow experiment name
        model_type: "classification" or "regression"

    Returns:
        Trained model and metrics dictionary
    """
    mlflow.set_experiment(experiment_name)

    with mlflow.start_run():
        # Log parameters
        mlflow.log_params(params)

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # Train model
        model = model_class(**params)
        model.fit(X_train, y_train)

        # Cross-validation
        cv_scores = cross_val_score(model, X_train, y_train, cv=5)
        mlflow.log_metric("cv_mean", cv_scores.mean())
        mlflow.log_metric("cv_std", cv_scores.std())

        # Evaluate on test set
        y_pred = model.predict(X_test)

        if model_type == "classification":
            metrics = {
                "accuracy": accuracy_score(y_test, y_pred),
                "precision": precision_score(y_test, y_pred, average="weighted"),
                "recall": recall_score(y_test, y_pred, average="weighted"),
                "f1": f1_score(y_test, y_pred, average="weighted"),
            }
        else:
            metrics = {
                "mse": mean_squared_error(y_test, y_pred),
                "rmse": np.sqrt(mean_squared_error(y_test, y_pred)),
                "r2": r2_score(y_test, y_pred),
            }

        # Log metrics
        for name, value in metrics.items():
            mlflow.log_metric(name, value)

        # Log model
        mlflow.sklearn.log_model(model, "model")

        logger.info(f"Training complete. Metrics: {metrics}")

        return model, metrics

def save_model(
    model: Any,
    version: str,
    feature_names: list,
    output_dir: str = "data/models"
) -> str:
    """
    Save model with metadata.

    Args:
        model: Trained model
        version: Model version string
        feature_names: List of feature names
        output_dir: Output directory

    Returns:
        Path to saved model
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d")
    filename = f"model_v{version}_{timestamp}.pkl"
    filepath = Path(output_dir) / filename

    artifact = {
        "model": model,
        "version": version,
        "feature_names": feature_names,
        "created_at": timestamp,
    }

    with open(filepath, "wb") as f:
        pickle.dump(artifact, f)

    # Also save as latest
    latest_path = Path(output_dir) / "model_latest.pkl"
    with open(latest_path, "wb") as f:
        pickle.dump(artifact, f)

    logger.info(f"Model saved to {filepath}")
    return str(filepath)
```

### LLM Integration (LangChain)

```python
# src/llm/chains.py
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, PromptTemplate
from langchain.chains import LLMChain
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Optional
import os

class AnalysisResult(BaseModel):
    """Structured output for analysis."""
    summary: str = Field(description="Brief summary of analysis")
    key_points: List[str] = Field(description="Key findings")
    confidence: float = Field(description="Confidence score 0-1")
    recommendations: Optional[List[str]] = Field(default=None)

def create_analysis_chain(
    model_name: str = "gpt-4",
    temperature: float = 0
) -> LLMChain:
    """
    Create an LLM chain for data analysis.

    Args:
        model_name: OpenAI model name
        temperature: Sampling temperature

    Returns:
        Configured LLMChain
    """
    llm = ChatOpenAI(
        model=model_name,
        temperature=temperature,
        api_key=os.getenv("OPENAI_API_KEY")
    )

    parser = PydanticOutputParser(pydantic_object=AnalysisResult)

    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert data analyst.
Analyze the provided data and return structured insights.
{format_instructions}"""),
        ("human", """Domain: {domain}
Data to analyze:
{data}

Provide your analysis:""")
    ])

    prompt = prompt.partial(format_instructions=parser.get_format_instructions())

    return LLMChain(llm=llm, prompt=prompt, output_parser=parser)

def create_embedding_function(model_name: str = "text-embedding-ada-002"):
    """Create embedding function for vector operations."""
    from langchain.embeddings import OpenAIEmbeddings

    return OpenAIEmbeddings(
        model=model_name,
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )
```

---

## VALIDACIONES OBLIGATORIAS

```bash
# 1. Tests (OBLIGATORIO)
pytest tests/ -v --cov=src
# ✅ Coverage > 70%

# 2. Type checking
mypy src/ --ignore-missing-imports
# ✅ Sin errores

# 3. Linting
ruff check src/
# ✅ Sin errores

# 4. API funcional
uvicorn src.api.main:app --reload
# ✅ Debe iniciar sin errores
# Verificar http://localhost:8000/docs

# 5. Métricas del modelo
# ✅ Deben cumplir objetivos definidos en specs
```

---

## MÉTRICAS OBJETIVO POR TIPO

```yaml
Clasificación:
  accuracy: ">= 0.85"
  f1_score: ">= 0.80"
  auc_roc: ">= 0.85"

Regresión:
  r2_score: ">= 0.75"
  rmse: "< umbral_negocio"
  mape: "< 10%"

Series_Temporales:
  mape: "< 10%"
  directional_accuracy: ">= 60%"

Ranking:
  ndcg_at_k: ">= 0.7"
  map_at_k: ">= 0.5"
```

---

## CHECKLIST ML

```
DATOS
├── [ ] Datos versionados (DVC o similar)
├── [ ] EDA documentado en notebook
├── [ ] Preprocessing reproducible
├── [ ] Train/test split definido
└── [ ] Feature engineering documentado

MODELO
├── [ ] Arquitectura documentada
├── [ ] Hiperparámetros en config file
├── [ ] Experimentos en MLflow
├── [ ] Cross-validation realizado
├── [ ] Métricas cumplen objetivo
└── [ ] Modelo serializado con metadata

API
├── [ ] FastAPI con schemas Pydantic
├── [ ] Endpoints documentados (OpenAPI)
├── [ ] Health check endpoint
├── [ ] Manejo de errores
├── [ ] Validación de entrada
└── [ ] Tests de API

DOCUMENTACIÓN
├── [ ] MODEL_CARD.md completo
├── [ ] Notebooks con conclusiones
├── [ ] README con instrucciones
└── [ ] Inventario actualizado
```

---

## MODEL_CARD.md TEMPLATE

```markdown
# Model Card: {nombre_modelo}

## Información General
- **Nombre:** {nombre}
- **Versión:** {version}
- **Fecha:** {fecha}
- **Autor:** ML-Specialist-Agent
- **Tipo:** {clasificación/regresión/etc}

## Descripción
{descripción del modelo y su propósito}

## Datos de Entrenamiento
- **Dataset:** {nombre}
- **Tamaño:** {n_samples} muestras
- **Features:** {n_features} características
- **Target:** {descripción}
- **Período:** {fecha_inicio} a {fecha_fin}

## Arquitectura
{descripción técnica del modelo}

## Hiperparámetros
| Parámetro | Valor |
|-----------|-------|
| {param1} | {valor1} |
| {param2} | {valor2} |

## Métricas
| Métrica | Train | Test | Objetivo |
|---------|-------|------|----------|
| {metric1} | X.XX | X.XX | >= X.XX |
| {metric2} | X.XX | X.XX | >= X.XX |

## Limitaciones
- {limitación 1}
- {limitación 2}

## Uso
```python
from src.inference.predictor import ModelPredictor

predictor = ModelPredictor()
predictor.load_model()
result = predictor.predict([0.5, 1.2, -0.3])
```

## Changelog
- v{version} ({fecha}): {cambios}
```

---

## ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| Data leakage | Preprocessing antes de split | Hacer split primero |
| Overfitting | Modelo muy complejo | Regularización, cross-val |
| API lenta | Modelo no optimizado | Batch processing, ONNX |
| Predicciones inconsistentes | Preprocessing diferente | Pipeline único |
| Memory issues | Datos muy grandes | Batch processing, Dask |

---

## REFERENCIAS

- **Crear archivos:** @CREAR (SIMCO-CREAR.md)
- **Validar:** @VALIDAR (SIMCO-VALIDAR.md)
- **Backend integration:** @BACKEND (SIMCO-BACKEND.md)
- **Perfil ML:** @PERFILES/PERFIL-ML-SPECIALIST.md

---

**Versión:** 1.0.0 | **Sistema:** SIMCO | **Mantenido por:** Tech Lead
