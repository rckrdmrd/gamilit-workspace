---
tipo: principio-diseno
nivel: 3-completo
version: 1.0.0
fecha: 2026-02-02
aplica_a:
  - backend-nestjs
  - frontend-react
  - todos-los-proyectos
alias:
  - "@YAGNI"
  - "@YOU-AINT-GONNA-NEED-IT"
  - "@NO-ANTICIPAR"
---

# PRINCIPIO: YAGNI - You Aren't Gonna Need It

**Version:** 1.0.0
**Fecha:** 2026-02-02
**Tipo:** Principio de Diseno - HERENCIA OBLIGATORIA
**Aplica a:** TODOS los proyectos del workspace
**Origen:** Extreme Programming (XP), Ron Jeffries, 1990s

---

## DECLARACION DEL PRINCIPIO

```
+============================================================================+
|                                                                             |
|     "Always implement things when you actually need them,                  |
|      never when you just foresee that you might need them."               |
|                                                                             |
|     "Siempre implementa las cosas cuando realmente las necesites,         |
|      nunca cuando solo preveas que podrias necesitarlas."                 |
|                                                                             |
|                                            - Ron Jeffries                   |
|                                                                             |
|     "The best code is no code at all."                                     |
|     "El mejor codigo es el que no existe."                                |
|                                                                             |
|                                            - Jeff Atwood                    |
|                                                                             |
+============================================================================+
```

---

## 1. DEFINICION

### Que es YAGNI

> **"No implementes funcionalidad hasta que la necesites. 'Por si acaso' no es una justificacion."**

YAGNI es un principio de Extreme Programming que establece que un programador no debe agregar funcionalidad hasta que sea necesaria. Se opone a la tendencia de anticipar necesidades futuras.

### Por Que Importa

```yaml
Codigo_Anticipado:
  - Tiempo invertido en algo que quiza no se use
  - Complejidad adicional que mantener
  - Tests para codigo innecesario
  - Documentacion de features fantasma
  - Posibles bugs en codigo que nadie usa
  - Deuda tecnica autoinfligida

Codigo_Bajo_Demanda:
  - Enfoque en requisitos reales
  - Codigo mas simple y limpio
  - Tests para lo que realmente existe
  - Menor superficie de bugs
  - Mas rapido de desarrollar
  - Facil de cambiar direccion
```

### El Costo Real del Codigo Anticipado

```yaml
Costo_Visible:
  - Tiempo de implementacion inicial
  - Tiempo de testing

Costo_Oculto:
  - Mantenimiento continuo
  - Actualizacion con cada refactor
  - Complejidad cognitiva
  - Decision paralysis por opciones
  - Integracion con nuevo codigo
  - Posible re-trabajo si requisitos cambian
```

---

## 2. EJEMPLOS DE VIOLACIONES YAGNI

### Ejemplo 1: Sistema de Plugins Innecesario

```typescript
// VIOLACION YAGNI: Sistema de plugins cuando solo hay una implementacion

// plugins/plugin.interface.ts
interface IPlugin {
  name: string;
  version: string;
  initialize(): Promise<void>;
  execute(context: PluginContext): Promise<PluginResult>;
  shutdown(): Promise<void>;
}

// plugins/plugin-manager.ts
class PluginManager {
  private plugins: Map<string, IPlugin> = new Map();
  private hooks: Map<string, HookCallback[]> = new Map();

  async registerPlugin(plugin: IPlugin): Promise<void> {
    await plugin.initialize();
    this.plugins.set(plugin.name, plugin);
    this.emit('plugin:registered', plugin);
  }

  async executePlugin(name: string, context: PluginContext): Promise<PluginResult> {
    const plugin = this.plugins.get(name);
    if (!plugin) throw new Error(`Plugin ${name} not found`);
    return plugin.execute(context);
  }

  // ... 200 lineas mas de codigo de gestion de plugins
}

// La UNICA implementacion real
class EmailNotificationPlugin implements IPlugin {
  name = 'email-notification';
  version = '1.0.0';
  // ... implementacion
}

// Todo esto para UNA funcionalidad


// CORRECTO: Implementacion directa
@Injectable()
export class NotificationService {
  constructor(private readonly emailService: EmailService) {}

  async sendNotification(user: User, message: string): Promise<void> {
    await this.emailService.send({
      to: user.email,
      subject: 'Notificacion',
      body: message,
    });
  }
}

// Cuando REALMENTE necesites plugins, entonces:
// 1. Refactorizar NotificationService a interfaz
// 2. Crear implementaciones adicionales
// 3. Agregar logica de seleccion
```

### Ejemplo 2: Configuracion Excesiva

```typescript
// VIOLACION YAGNI: Configuracion para casos que no existen

interface AppConfig {
  // Configuracion real necesaria
  database: {
    host: string;
    port: number;
    name: string;
  };

  // Configuracion "por si acaso"
  cache: {
    enabled: boolean;          // Siempre true
    provider: 'redis' | 'memcached' | 'memory';  // Siempre redis
    ttl: number;
    maxSize: number;
    evictionPolicy: 'lru' | 'lfu' | 'fifo';  // Nunca se cambia
  };

  // Mas configuracion anticipada
  featureFlags: {
    enableNewUI: boolean;       // No hay "nueva UI"
    useMicroservices: boolean;  // Es un monolito
    enableAuditLog: boolean;    // No hay audit log implementado
    multiTenancy: boolean;      // No hay multi-tenancy
  };

  // Integraciones que no existen
  integrations: {
    slack?: SlackConfig;
    jira?: JiraConfig;
    salesforce?: SalesforceConfig;  // Ninguna implementada
  };
}


// CORRECTO: Solo lo necesario
interface AppConfig {
  database: {
    host: string;
    port: number;
    name: string;
  };
  redis: {
    host: string;
    port: number;
  };
}

// Cuando necesites cache configurable:
// 1. Agregar configuracion de cache
// 2. Implementar provider selection
// NO antes
```

### Ejemplo 3: Generalizacion Prematura

```typescript
// VIOLACION YAGNI: API generica para un solo uso

// "Generic" data fetcher que solo se usa para usuarios
class DataFetcher<T, F extends Record<string, any>> {
  constructor(
    private readonly endpoint: string,
    private readonly transformer: (data: any) => T,
    private readonly filterBuilder: (filters: F) => Record<string, string>,
  ) {}

  async fetch(filters?: F): Promise<T[]> {
    const params = filters ? this.filterBuilder(filters) : {};
    const response = await api.get(this.endpoint, { params });
    return response.data.map(this.transformer);
  }

  async fetchOne(id: string): Promise<T> {
    const response = await api.get(`${this.endpoint}/${id}`);
    return this.transformer(response.data);
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await api.post(this.endpoint, data);
    return this.transformer(response.data);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const response = await api.patch(`${this.endpoint}/${id}`, data);
    return this.transformer(response.data);
  }
}

// El UNICO uso
const userFetcher = new DataFetcher<User, UserFilters>(
  '/api/users',
  transformUser,
  buildUserFilters
);


// CORRECTO: Service especifico
class UserService {
  async getUsers(filters?: UserFilters): Promise<User[]> {
    const params = this.buildParams(filters);
    const response = await api.get('/api/users', { params });
    return response.data.map(this.transformUser);
  }

  async getUser(id: string): Promise<User> {
    const response = await api.get(`/api/users/${id}`);
    return this.transformUser(response.data);
  }

  private transformUser(data: any): User {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
    };
  }

  private buildParams(filters?: UserFilters): Record<string, string> {
    if (!filters) return {};
    return {
      ...(filters.status && { status: filters.status }),
      ...(filters.search && { q: filters.search }),
    };
  }
}

// Cuando necesites otro service similar:
// 1. Crear OrderService con su propia implementacion
// 2. Si hay 3+ services similares, ENTONCES extraer base class
```

### Ejemplo 4: Abstracciones Innecesarias en React

```tsx
// VIOLACION YAGNI: HOC generico para un solo componente

function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  FallbackComponent: React.ComponentType<{ error: Error; reset: () => void }>,
  options?: {
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    shouldCatch?: (error: Error) => boolean;
    resetKeys?: Array<keyof P>;
  }
) {
  return class ErrorBoundaryWrapper extends React.Component<
    P,
    { hasError: boolean; error: Error | null }
  > {
    // ... 50 lineas de implementacion
  };
}

// Usado exactamente UNA vez
const SafeUserProfile = withErrorBoundary(
  UserProfile,
  UserProfileError,
  { onError: logError }
);


// CORRECTO: Implementacion directa
function UserProfilePage() {
  return (
    <ErrorBoundary
      fallback={<UserProfileError />}
      onError={logError}
    >
      <UserProfile />
    </ErrorBoundary>
  );
}

// ErrorBoundary es un componente simple y reutilizable
// Si necesitas customizarlo mas, hazlo CUANDO lo necesites
```

### Ejemplo 5: Features Flags Fantasma

```typescript
// VIOLACION YAGNI: Codigo para features que no existen

class OrderService {
  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const order = await this.orderRepository.create(dto);

    // Feature que no existe y no esta planeada
    if (this.featureFlags.isEnabled('loyalty_points')) {
      await this.loyaltyService.addPoints(order.userId, order.total);
    }

    // Otra feature fantasma
    if (this.featureFlags.isEnabled('order_notifications')) {
      await this.notificationService.notifyOrderCreated(order);
    }

    // Y otra mas
    if (this.featureFlags.isEnabled('inventory_sync')) {
      await this.inventoryService.syncAfterOrder(order);
    }

    return order;
  }
}

// Resultado: codigo que nunca se ejecuta, tests que no prueban nada real


// CORRECTO: Solo codigo que se usa
class OrderService {
  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const order = await this.orderRepository.create(dto);

    // Solo lo que realmente esta implementado
    await this.emailService.sendOrderConfirmation(order);

    return order;
  }
}

// Cuando loyalty points sea un requisito REAL:
// 1. Implementar LoyaltyService
// 2. Agregar la integracion
// 3. Escribir tests
```

---

## 3. CUANDO APLICAR YAGNI

### Aplicar YAGNI Cuando

```yaml
Aplicar_Estrictamente:
  - El requisito no existe en el backlog actual
  - "Algun dia necesitaremos esto" es la justificacion
  - Solo hay una implementacion posible actualmente
  - El codigo no sera usado en el sprint actual
  - Es una optimizacion prematura

Preguntas_Clave:
  - "Quien pidio esta feature?"
  - "Cuando se usara esto?"
  - "Que pasa si no lo implemento?"
  - "Puedo agregarlo facilmente despues?"
```

### Cuando YAGNI No Aplica

```yaml
No_Aplicar_Cuando:
  - Es un requisito no funcional (seguridad, logging basico)
  - La arquitectura base lo requiere
  - El costo de agregar despues es exponencialmente mayor
  - Es un estandar del equipo/organizacion
  - Ya existe en el backlog con fecha cercana

Ejemplos_Validos_de_Anticipacion:
  - Indices de base de datos para queries frecuentes
  - Autenticacion/autorizacion desde el inicio
  - Logging estructurado
  - Health checks basicos
  - Configuracion por ambiente
```

### Balance con Arquitectura

```yaml
Arquitectura_vs_YAGNI:
  - YAGNI aplica a FEATURES, no a fundamentos
  - La arquitectura base es inversion necesaria
  - Pero no sobre-arquitecturar

Ejemplo:
  OK:     Crear estructura de carpetas por capas
  NO_OK:  Crear sistema de plugins sin plugins

  OK:     Configurar TypeORM con migraciones
  NO_OK:  Agregar soporte para 5 bases de datos diferentes

  OK:     Implementar autenticacion JWT
  NO_OK:  Agregar OAuth para 10 providers diferentes
```

---

## 4. REFACTORIZAR CUANDO SEA NECESARIO

### El Ciclo YAGNI

```
1. IMPLEMENTAR lo minimo necesario
         |
         v
2. ENTREGAR valor al usuario
         |
         v
3. RECIBIR feedback real
         |
         v
4. IDENTIFICAR necesidades reales
         |
         v
5. REFACTORIZAR para soportar nuevos requisitos
         |
         +---> volver a 1
```

### Ejemplo de Refactoring Incremental

```typescript
// FASE 1: Requisito inicial - enviar emails
// Solo implementamos lo necesario

class NotificationService {
  constructor(private readonly emailService: EmailService) {}

  async notify(user: User, message: string): Promise<void> {
    await this.emailService.send({
      to: user.email,
      subject: 'Notificacion',
      body: message,
    });
  }
}


// FASE 2: Nuevo requisito - tambien SMS
// AHORA refactorizamos para soportar multiples canales

interface NotificationChannel {
  send(recipient: string, message: string): Promise<void>;
}

class EmailChannel implements NotificationChannel {
  constructor(private readonly emailService: EmailService) {}

  async send(recipient: string, message: string): Promise<void> {
    await this.emailService.send({
      to: recipient,
      subject: 'Notificacion',
      body: message,
    });
  }
}

class SmsChannel implements NotificationChannel {
  constructor(private readonly smsService: SmsService) {}

  async send(recipient: string, message: string): Promise<void> {
    await this.smsService.send(recipient, message);
  }
}

class NotificationService {
  constructor(
    private readonly channels: Map<string, NotificationChannel>,
  ) {}

  async notify(
    user: User,
    message: string,
    channel: 'email' | 'sms' = 'email'
  ): Promise<void> {
    const notificationChannel = this.channels.get(channel);
    const recipient = channel === 'email' ? user.email : user.phone;
    await notificationChannel.send(recipient, message);
  }
}


// FASE 3: Nuevo requisito - push notifications
// Solo agregamos nuevo canal, la arquitectura ya lo soporta

class PushChannel implements NotificationChannel {
  constructor(private readonly pushService: PushService) {}

  async send(recipient: string, message: string): Promise<void> {
    await this.pushService.send(recipient, { body: message });
  }
}

// Registro del nuevo canal en el modulo
// Sin cambios en NotificationService
```

### Cuando Refactorizar

```yaml
Senales_de_Refactoring_Necesario:
  - Nuevo requisito real (no hipotetico)
  - Tercer uso de patron similar (Rule of Three)
  - Dolor de mantenimiento tangible
  - Bug recurrente por codigo enredado

No_Refactorizar_Por:
  - "Seria bonito tener esto"
  - "Algun dia lo necesitaremos"
  - "El codigo podria ser mas elegante"
  - "Vi este patron en un blog"
```

---

## 5. CHECKLIST DE VALIDACION

### Antes de Implementar Nueva Funcionalidad

```markdown
[ ] Esta funcionalidad esta en el backlog actual?
[ ] Hay un usuario/stakeholder que la pidio?
[ ] Se usara en este sprint/release?
[ ] Cual es el costo de NO implementarla ahora?
[ ] Puedo agregarla facilmente despues si la necesito?
```

### Durante Code Review

```markdown
[ ] Todo el codigo nuevo tiene un uso inmediato?
[ ] Hay abstracciones sin multiples implementaciones?
[ ] Hay configuraciones para features inexistentes?
[ ] Hay interfaces/tipos que solo tienen una implementacion?
[ ] Hay codigo comentado "para despues"?
```

### Preguntas para el Autor del PR

```markdown
1. "Cuando se usara [esta feature/abstraccion]?"
   - Si "eventualmente": rechazar o simplificar

2. "Que usuario necesita esto?"
   - Si "nadie aun": rechazar

3. "Que pasa si removemos [esta parte]?"
   - Si "nada cambia": remover

4. "Por que [esta configuracion] en lugar de hardcodear?"
   - Si "flexibilidad futura": hardcodear
```

---

## ANTI-PATRONES COMUNES

```yaml
Anti_Patron_1_Arquitectura_Astronauta:
  Descripcion: Sobre-arquitecturar para problemas que no existen
  Ejemplo: Microservicios para una app de 3 endpoints
  Solucion: Empezar con monolito, escalar cuando duela

Anti_Patron_2_Configuracion_Infinita:
  Descripcion: Todo es configurable aunque nunca cambie
  Ejemplo: 50 variables de entorno para un CRUD
  Solucion: Hardcodear, extraer config cuando cambie

Anti_Patron_3_Abstraccion_Especulativa:
  Descripcion: Crear interfaces "por si hay otra implementacion"
  Ejemplo: IUserRepository cuando solo habra PostgreSQL
  Solucion: Clase concreta, extraer interfaz cuando haya segunda impl

Anti_Patron_4_Feature_Flags_Fantasma:
  Descripcion: Flags para features que no estan implementadas
  Ejemplo: if (featureFlags.newPaymentSystem) { /* vacio */ }
  Solucion: Implementar feature completa o no agregar el flag

Anti_Patron_5_Generalizacion_Prematura:
  Descripcion: Codigo generico para un solo caso de uso
  Ejemplo: Framework de validacion custom para 3 campos
  Solucion: Validacion especifica, generalizar con 3+ usos
```

---

## FRASES PARA RECORDAR

```
"Premature optimization is the root of all evil."
- Donald Knuth

"The first rule of optimization is: Don't do it.
 The second rule (for experts only) is: Don't do it yet."
- Michael A. Jackson

"Perfection is achieved not when there is nothing more to add,
 but when there is nothing left to take away."
- Antoine de Saint-Exupery

"The cheapest, fastest, and most reliable components are those
 that aren't there."
- Gordon Bell
```

---

## REFERENCIAS

```yaml
Libros:
  - "Extreme Programming Explained" - Kent Beck
  - "The Pragmatic Programmer" - Hunt & Thomas
  - "Clean Code" - Robert C. Martin

Articulos:
  - "You Aren't Gonna Need It" - c2.com/xp/YouArentGonnaNeedIt
  - "Worse is Better" - Richard Gabriel

SIMCO_Relacionados:
  - "@KISS" - Keep It Simple
  - "@DRY" - Don't Repeat Yourself
  - "@SOLID" - Principios SOLID
```

---

## ALIAS

```yaml
@YAGNI:                   orchestration/directivas/principios/PRINCIPIO-YAGNI.md
@YOU-AINT-GONNA-NEED-IT:  orchestration/directivas/principios/PRINCIPIO-YAGNI.md
@NO-ANTICIPAR:            orchestration/directivas/principios/PRINCIPIO-YAGNI.md
```

---

**Este principio es OBLIGATORIO para todos los proyectos del workspace.**

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Principio de Diseno
