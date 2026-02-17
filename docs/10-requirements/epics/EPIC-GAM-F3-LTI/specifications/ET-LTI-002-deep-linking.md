# ET-LTI-002: Deep Linking

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-LTI-002 |
| **Modulo** | LTI Integration |
| **Titulo** | Implementacion de Deep Linking (Content Selection) |
| **Prioridad** | Media |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 25% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Estado de Implementacion

### Progreso General: 25%

| Componente | Estado | Completitud |
|------------|--------|-------------|
| LtiSession Entity (base) | COMPLETO | 100% |
| LtiConsumer Entity | COMPLETO | 100% |
| Deep Linking Controller | NO INICIADO | 0% |
| Deep Linking Service | NO INICIADO | 0% |
| Content Picker UI | NO INICIADO | 0% |
| Deep Linking Response Builder | NO INICIADO | 0% |
| LMS Platform Tests | NO INICIADO | 0% |

---

## Referencias

### Requerimiento Funcional
- RF-LTI-003: Deep Linking Services

### User Stories
- [US-LTI-003: Deep Linking](../user-stories/US-LTI-003/US-LTI-003-deep-linking.md)

### Estandar
- IMS Global LTI Advantage - Deep Linking Specification 2.0

---

## Descripcion Funcional

Deep Linking permite que profesores seleccionen contenido especifico de GAMILIT (ejercicios, modulos, unidades) desde dentro del LMS y lo vinculen a una actividad/assignment del curso.

### Flujo de Deep Linking

```
Profesor en LMS crea actividad
        |
        v
Selecciona "GAMILIT" como herramienta
        |
        v
LMS envia LtiDeepLinkingRequest a GAMILIT
        |
        v
(FALTANTE) DeepLinkingController.handleLaunch()
  - Valida JWT
  - Extrae deep_linking_settings
        |
        v
(FALTANTE) ContentPickerPage
  - Muestra modulos/ejercicios disponibles
  - Profesor selecciona contenido
        |
        v
(FALTANTE) DeepLinkingService.buildResponse()
  - Genera JWT con LtiResourceLink
  - Firma con private key
        |
        v
POST a deep_linking_return_url del LMS
        |
        v
LMS crea assignment con enlace a GAMILIT
```

---

## Arquitectura

### Diagrama de Capas

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - (FALTANTE) ContentPickerPage                          |
|  - (FALTANTE) ModuleSelector                             |
|  - (FALTANTE) ExerciseSelector                           |
|  - (FALTANTE) DeepLinkConfirmation                       |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - (FALTANTE) DeepLinkingController                      |
|  - (FALTANTE) DeepLinkingService                         |
|  - LtiConsumersService (EXISTENTE)                       |
|  - LtiSessionsService (EXISTENTE)                        |
+-----------------------------+----------------------------+
                              | JWT/JWK
+-----------------------------v----------------------------+
|                  EXTERNAL LMS                             |
|  - Canvas / Moodle / Blackboard                          |
|  - deep_linking_return_url                               |
+----------------------------------------------------------+
```

---

## Implementacion Existente

### LtiSession Entity (Base para Deep Linking)

**Ubicacion:** `apps/backend/src/modules/lti/entities/lti-session.entity.ts`

**Campos Relevantes:**
| Campo | Tipo | Uso en Deep Linking |
|-------|------|---------------------|
| messageType | TEXT | 'LtiDeepLinkingRequest' |
| contextId | TEXT | ID del curso en LMS |
| contextTitle | TEXT | Nombre del curso |
| resourceLinkId | TEXT | ID del resource link |
| idTokenClaims | JSONB | Contiene deep_linking_settings |

### LtiConsumer Entity (Configuracion de Plataforma)

**Ubicacion:** `apps/backend/src/modules/lti/entities/lti-consumer.entity.ts`

**Campos Relevantes:**
- clientId, consumerKey, consumerSecret
- launchUrl, platform
- Public/Private keys para firma

---

## Lo que Falta para Completar (75%)

### 1. DeepLinkingController (20% de lo faltante)

```typescript
// controllers/deep-linking.controller.ts (NUEVO)
@Controller('lti/deep-linking')
export class DeepLinkingController {

  /**
   * Maneja el launch de deep linking desde LMS
   * POST /lti/deep-linking/launch
   */
  @Post('launch')
  async handleLaunch(@Body() launchData: DeepLinkingLaunchDto) {
    // 1. Validar JWT del LMS
    // 2. Extraer deep_linking_settings
    // 3. Crear sesion de deep linking
    // 4. Redirigir a content picker UI
  }

  /**
   * Recibe seleccion de contenido y envia respuesta a LMS
   * POST /lti/deep-linking/respond
   */
  @Post('respond')
  async respond(
    @Body() selection: ContentSelectionDto,
    @Query('session_id') sessionId: string
  ) {
    // 1. Obtener sesion y deep_linking_settings
    // 2. Construir LtiResourceLink items
    // 3. Firmar respuesta JWT
    // 4. POST a deep_linking_return_url
  }
}
```

### 2. DeepLinkingService (25% de lo faltante)

```typescript
// services/deep-linking.service.ts (NUEVO)
@Injectable()
export class DeepLinkingService {

  /**
   * Valida el JWT de deep linking request
   */
  async validateDeepLinkingRequest(
    idToken: string,
    consumer: LtiConsumer
  ): Promise<DeepLinkingClaims>;

  /**
   * Extrae configuracion de deep linking del JWT
   */
  extractDeepLinkingSettings(
    claims: DeepLinkingClaims
  ): DeepLinkingSettings;

  /**
   * Obtiene contenido disponible para seleccionar
   */
  async getAvailableContent(
    tenantId: string,
    filters?: ContentFilters
  ): Promise<SelectableContent[]>;

  /**
   * Construye respuesta de deep linking con items seleccionados
   */
  async buildDeepLinkingResponse(
    sessionId: string,
    selectedContent: SelectedContent[]
  ): Promise<DeepLinkingResponse>;

  /**
   * Firma la respuesta JWT con clave privada
   */
  signResponse(
    response: DeepLinkingResponse,
    consumer: LtiConsumer
  ): string;

  /**
   * Envia respuesta firmada al LMS
   */
  async submitToLms(
    returnUrl: string,
    signedJwt: string
  ): Promise<void>;
}
```

### 3. Content Picker UI (25% de lo faltante)

**Componentes Frontend Faltantes:**

| Componente | Descripcion |
|------------|-------------|
| ContentPickerPage | Pagina principal del picker |
| ModuleBrowser | Navegador de modulos disponibles |
| ExerciseGrid | Grid de ejercicios seleccionables |
| ContentPreview | Preview del contenido seleccionado |
| SelectionConfirmation | Confirmacion antes de enviar |
| DeepLinkBreadcrumb | Navegacion dentro del picker |

**Estructura de Pagina:**
```tsx
// pages/lti/ContentPickerPage.tsx (NUEVO)
const ContentPickerPage: React.FC = () => {
  const { sessionId } = useParams();
  const { settings } = useDeepLinkingSession(sessionId);
  const [selected, setSelected] = useState<SelectedContent[]>([]);

  return (
    <DeepLinkingLayout>
      <ModuleBrowser onSelect={handleModuleSelect} />
      <ExerciseGrid moduleId={selectedModule} onSelect={handleExerciseSelect} />
      <SelectionSummary items={selected} />
      <ConfirmButton onClick={handleConfirm} />
    </DeepLinkingLayout>
  );
};
```

### 4. DTOs y Tipos (5% de lo faltante)

```typescript
// dto/deep-linking.dto.ts (NUEVO)

export class DeepLinkingLaunchDto {
  @IsString()
  id_token: string;

  @IsOptional()
  @IsString()
  state?: string;
}

export class ContentSelectionDto {
  @IsArray()
  @ValidateNested({ each: true })
  items: SelectedContentItemDto[];
}

export class SelectedContentItemDto {
  @IsEnum(['module', 'exercise', 'unit'])
  type: 'module' | 'exercise' | 'unit';

  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}

// Interfaces
export interface DeepLinkingSettings {
  deep_link_return_url: string;
  accept_types: string[];
  accept_presentation_document_targets: string[];
  accept_multiple: boolean;
  auto_create: boolean;
  title?: string;
  text?: string;
}

export interface LtiResourceLinkItem {
  type: 'ltiResourceLink';
  title: string;
  url: string;
  custom?: Record<string, string>;
  lineItem?: {
    scoreMaximum: number;
    label: string;
    tag?: string;
  };
}
```

---

## Especificacion Tecnica

### Deep Linking JWT Claims (Entrada)

```json
{
  "iss": "https://lms.example.edu",
  "sub": "professor-123",
  "aud": ["gamilit-client-id"],
  "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiDeepLinkingRequest",
  "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
  "https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings": {
    "deep_link_return_url": "https://lms.example.edu/deep_link/callback",
    "accept_types": ["ltiResourceLink"],
    "accept_presentation_document_targets": ["iframe", "window"],
    "accept_multiple": true,
    "auto_create": false,
    "title": "Select content",
    "text": "Please select exercises for this assignment"
  }
}
```

### Deep Linking Response JWT (Salida)

```json
{
  "iss": "gamilit-client-id",
  "aud": ["https://lms.example.edu"],
  "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiDeepLinkingResponse",
  "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
  "https://purl.imsglobal.org/spec/lti-dl/claim/content_items": [
    {
      "type": "ltiResourceLink",
      "title": "Modulo 1: Vocabulario Basico",
      "url": "https://gamilit.com/lti/launch?module=mod-123",
      "lineItem": {
        "scoreMaximum": 100,
        "label": "Vocabulario Basico"
      },
      "custom": {
        "module_id": "mod-123",
        "type": "module"
      }
    }
  ]
}
```

---

## API REST Endpoints (A Implementar)

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| POST | `/lti/deep-linking/launch` | Recibir launch desde LMS | LMS |
| GET | `/lti/deep-linking/session/:id` | Obtener info de sesion | TEACHER |
| GET | `/lti/deep-linking/content` | Listar contenido seleccionable | TEACHER |
| POST | `/lti/deep-linking/respond` | Enviar seleccion a LMS | TEACHER |

---

## Criterios de Aceptacion

### Funcionales
- [ ] Profesor puede navegar modulos y ejercicios desde el content picker
- [ ] Seleccion multiple de contenido si el LMS lo permite
- [ ] Preview del contenido antes de seleccionar
- [ ] Respuesta correctamente firmada y aceptada por Canvas
- [ ] Respuesta correctamente firmada y aceptada por Moodle
- [ ] Link creado en LMS abre contenido correcto en GAMILIT

### No Funcionales
- [ ] Content picker carga en < 3 segundos
- [ ] UI responsiva para uso en iframe de LMS
- [ ] Soporte para tema oscuro/claro del LMS

### Seguridad
- [ ] Validacion de firma JWT del LMS
- [ ] Verificacion de issuer y audience
- [ ] Expiracion de sesiones de deep linking (15 min)
- [ ] CSRF protection via state parameter

---

## Dependencias

### Bloqueado Por
- LtiConsumersService (COMPLETO)
- LtiSessionsService (COMPLETO)
- Ejercicios y Modulos educativos (COMPLETO)

### Bloquea
- Uso de GAMILIT como herramienta en Canvas/Moodle
- Configuracion de assignments desde LMS

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| DeepLinkingController | 6h |
| DeepLinkingService | 8h |
| Content Picker UI | 10h |
| DTOs y Validaciones | 2h |
| Tests de Integracion | 4h |
| **Total** | **30h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-LTI-002-deep-linking.md*
*Generado: 2026-01-27*
