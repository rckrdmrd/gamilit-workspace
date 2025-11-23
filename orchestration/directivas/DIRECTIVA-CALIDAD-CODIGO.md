# DIRECTIVA: CALIDAD DE CÓDIGO Y PRINCIPIOS SOLID

**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
**Versión:** 1.0.0
**Fecha:** 2025-11-20
**Ámbito:** Backend-Agent, Frontend-Agent (aplica también a Database-Agent para lógica SQL)
**Tipo:** Directiva Obligatoria

---

## 🎯 PROPÓSITO

Establecer estándares de calidad de código que garanticen:
- **Mantenibilidad** a largo plazo
- **Escalabilidad** sin refactorización masiva
- **Testabilidad** con cobertura adecuada
- **Legibilidad** para cualquier desarrollador
- **Consistencia** en todo el codebase

---

## 📐 PRINCIPIOS SOLID

Los principios SOLID son **OBLIGATORIOS** en todo el código backend y frontend.

### S - Single Responsibility Principle (SRP)

**Definición:** Una clase/función debe tener una sola razón para cambiar.

#### ✅ Correcto

```typescript
// Backend: Service con responsabilidad única
export class ProjectService {
  constructor(
    @InjectRepository(ProjectEntity)
    private projectRepo: Repository<ProjectEntity>,
  ) {}

  async create(dto: CreateProjectDto): Promise<ProjectEntity> {
    const project = this.projectRepo.create(dto);
    return await this.projectRepo.save(project);
  }

  async findById(id: string): Promise<ProjectEntity> {
    return await this.projectRepo.findOne({ where: { id } });
  }
}

// Responsabilidades separadas
export class ProjectValidator {
  validateCode(code: string): boolean {
    return /^PRJ-\d{4}$/.test(code);
  }
}

export class ProjectNotificationService {
  async notifyCreation(project: ProjectEntity): Promise<void> {
    // Lógica de notificación
  }
}
```

#### ❌ Incorrecto

```typescript
// ❌ Clase con múltiples responsabilidades
export class ProjectService {
  async create(dto: CreateProjectDto): Promise<ProjectEntity> {
    // Validación (debería estar en validator)
    if (!/^PRJ-\d{4}$/.test(dto.code)) {
      throw new Error('Invalid code');
    }

    // Persistencia (OK)
    const project = await this.projectRepo.save(dto);

    // Notificación (debería estar en notification service)
    await this.sendEmail(project);

    // Logging (debería estar en logger service)
    console.log(`Project created: ${project.id}`);

    return project;
  }
}
```

---

### O - Open/Closed Principle (OCP)

**Definición:** Abierto para extensión, cerrado para modificación.

#### ✅ Correcto

```typescript
// Backend: Extensible sin modificar código existente
export interface ReportGenerator {
  generate(data: any): Promise<Buffer>;
}

export class PDFReportGenerator implements ReportGenerator {
  async generate(data: any): Promise<Buffer> {
    // Generar PDF
  }
}

export class ExcelReportGenerator implements ReportGenerator {
  async generate(data: any): Promise<Buffer> {
    // Generar Excel
  }
}

export class ReportService {
  constructor(private generators: Map<string, ReportGenerator>) {}

  async generateReport(type: string, data: any): Promise<Buffer> {
    const generator = this.generators.get(type);
    if (!generator) throw new Error(`Unknown type: ${type}`);
    return generator.generate(data);
  }
}

// Agregar nuevo formato SIN modificar ReportService
export class CSVReportGenerator implements ReportGenerator {
  async generate(data: any): Promise<Buffer> {
    // Generar CSV
  }
}
```

#### ❌ Incorrecto

```typescript
// ❌ Modificar clase cada vez que se agrega formato
export class ReportService {
  async generateReport(type: string, data: any): Promise<Buffer> {
    if (type === 'pdf') {
      // Generar PDF
    } else if (type === 'excel') {
      // Generar Excel
    } else if (type === 'csv') {  // ❌ Modificar código existente
      // Generar CSV
    }
  }
}
```

---

### L - Liskov Substitution Principle (LSP)

**Definición:** Los subtipos deben ser sustituibles por sus tipos base.

#### ✅ Correcto

```typescript
// Backend: Sustitución sin romper comportamiento
abstract class BaseRepository<T> {
  abstract findAll(): Promise<T[]>;
  abstract findById(id: string): Promise<T>;
  abstract save(entity: T): Promise<T>;
}

class ProjectRepository extends BaseRepository<ProjectEntity> {
  async findAll(): Promise<ProjectEntity[]> {
    // Implementación que respeta contrato
    return await this.repo.find();
  }

  async findById(id: string): Promise<ProjectEntity> {
    const project = await this.repo.findOne({ where: { id } });
    if (!project) throw new NotFoundException();
    return project;
  }

  async save(entity: ProjectEntity): Promise<ProjectEntity> {
    return await this.repo.save(entity);
  }
}

// Se puede sustituir BaseRepository por ProjectRepository sin problemas
function processRepository(repo: BaseRepository<any>) {
  const all = await repo.findAll();  // Funciona con cualquier implementación
}
```

#### ❌ Incorrecto

```typescript
// ❌ Rompe contrato del padre
class ProjectRepository extends BaseRepository<ProjectEntity> {
  async findAll(): Promise<ProjectEntity[]> {
    // ❌ Rompe contrato: lanza excepción en lugar de retornar array vacío
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<ProjectEntity> {
    // ❌ Rompe contrato: retorna null en lugar de lanzar excepción
    return await this.repo.findOne({ where: { id } }) || null;
  }
}
```

---

### I - Interface Segregation Principle (ISP)

**Definición:** Los clientes no deben depender de interfaces que no usan.

#### ✅ Correcto

```typescript
// Backend: Interfaces segregadas
export interface Readable<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T>;
}

export interface Writable<T> {
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

// Servicio que solo lee NO necesita implementar write
export class ProjectReaderService implements Readable<ProjectEntity> {
  async findAll(): Promise<ProjectEntity[]> { /*...*/ }
  async findById(id: string): Promise<ProjectEntity> { /*...*/ }
  // ✅ No tiene que implementar save/delete
}

// Servicio completo implementa ambas
export class ProjectService implements Readable<ProjectEntity>, Writable<ProjectEntity> {
  async findAll(): Promise<ProjectEntity[]> { /*...*/ }
  async findById(id: string): Promise<ProjectEntity> { /*...*/ }
  async save(entity: ProjectEntity): Promise<ProjectEntity> { /*...*/ }
  async delete(id: string): Promise<void> { /*...*/ }
}
```

#### ❌ Incorrecto

```typescript
// ❌ Interface monolítica
export interface Repository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
  bulkInsert(entities: T[]): Promise<T[]>;
  archive(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}

// ❌ Servicio de solo lectura FORZADO a implementar métodos no usados
export class ProjectReaderService implements Repository<ProjectEntity> {
  async findAll(): Promise<ProjectEntity[]> { /*...*/ }
  async findById(id: string): Promise<ProjectEntity> { /*...*/ }

  // ❌ Implementaciones vacías/lanzando errores
  async save(entity: ProjectEntity): Promise<ProjectEntity> {
    throw new Error('Not supported');
  }
  async delete(id: string): Promise<void> {
    throw new Error('Not supported');
  }
  async bulkInsert(entities: ProjectEntity[]): Promise<ProjectEntity[]> {
    throw new Error('Not supported');
  }
}
```

---

### D - Dependency Inversion Principle (DIP)

**Definición:** Depender de abstracciones, no de implementaciones concretas.

#### ✅ Correcto

```typescript
// Backend: Inyección de dependencias con abstracciones
export interface ILogger {
  log(message: string): void;
  error(message: string, error: Error): void;
}

export class ConsoleLogger implements ILogger {
  log(message: string): void {
    console.log(message);
  }
  error(message: string, error: Error): void {
    console.error(message, error);
  }
}

export class FileLogger implements ILogger {
  log(message: string): void {
    fs.appendFileSync('app.log', message);
  }
  error(message: string, error: Error): void {
    fs.appendFileSync('error.log', `${message}: ${error.message}`);
  }
}

// ✅ Servicio depende de abstracción
export class ProjectService {
  constructor(
    @Inject('ILogger') private logger: ILogger,  // Abstracción
    @InjectRepository(ProjectEntity)
    private projectRepo: Repository<ProjectEntity>,
  ) {}

  async create(dto: CreateProjectDto): Promise<ProjectEntity> {
    this.logger.log('Creating project');  // Usa abstracción
    return await this.projectRepo.save(dto);
  }
}

// Configuración de DI
providers: [
  { provide: 'ILogger', useClass: ConsoleLogger },  // Fácil cambiar implementación
]
```

#### ❌ Incorrecto

```typescript
// ❌ Dependencia directa de implementación concreta
export class ProjectService {
  private logger: ConsoleLogger;  // ❌ Implementación concreta

  constructor() {
    this.logger = new ConsoleLogger();  // ❌ Acoplamiento fuerte
  }

  async create(dto: CreateProjectDto): Promise<ProjectEntity> {
    this.logger.log('Creating project');
    return await this.projectRepo.save(dto);
  }
}

// ❌ Imposible cambiar a FileLogger sin modificar ProjectService
```

---

## 🏗️ PATRONES DE DISEÑO RECOMENDADOS

### 1. Repository Pattern (Backend)

```typescript
// ✅ Abstrae acceso a datos
export interface IProjectRepository {
  findByCode(code: string): Promise<ProjectEntity | null>;
  findActiveProjects(): Promise<ProjectEntity[]>;
  countByStatus(status: string): Promise<number>;
}

@Injectable()
export class ProjectRepository implements IProjectRepository {
  constructor(
    @InjectRepository(ProjectEntity)
    private repo: Repository<ProjectEntity>,
  ) {}

  async findByCode(code: string): Promise<ProjectEntity | null> {
    return this.repo.findOne({ where: { code } });
  }

  async findActiveProjects(): Promise<ProjectEntity[]> {
    return this.repo.find({ where: { status: 'active' } });
  }

  async countByStatus(status: string): Promise<number> {
    return this.repo.count({ where: { status } });
  }
}
```

### 2. Factory Pattern (Backend/Frontend)

```typescript
// Backend: Factory para crear entities
export class ProjectFactory {
  static create(dto: CreateProjectDto, userId: string): ProjectEntity {
    const project = new ProjectEntity();
    project.code = dto.code;
    project.name = dto.name;
    project.status = 'draft';
    project.createdById = userId;
    project.createdAt = new Date();
    return project;
  }

  static createFromExternal(data: ExternalProjectData): ProjectEntity {
    const project = new ProjectEntity();
    project.code = this.generateCode(data.externalId);
    project.name = data.title;
    project.status = this.mapStatus(data.state);
    return project;
  }

  private static generateCode(externalId: string): string {
    return `PRJ-${externalId.padStart(4, '0')}`;
  }
}
```

### 3. Strategy Pattern (Backend)

```typescript
// Backend: Estrategias de cálculo
export interface IPricingStrategy {
  calculate(project: ProjectEntity): Promise<number>;
}

export class StandardPricing implements IPricingStrategy {
  async calculate(project: ProjectEntity): Promise<number> {
    return project.basePrice * 1.16;  // + IVA
  }
}

export class DiscountedPricing implements IPricingStrategy {
  async calculate(project: ProjectEntity): Promise<number> {
    return project.basePrice * 0.9 * 1.16;  // 10% descuento + IVA
  }
}

export class PricingService {
  constructor(private strategies: Map<string, IPricingStrategy>) {}

  async calculatePrice(project: ProjectEntity, type: string): Promise<number> {
    const strategy = this.strategies.get(type);
    return strategy.calculate(project);
  }
}
```

### 4. Observer Pattern (Frontend)

```typescript
// Frontend: State management con Zustand (observer pattern)
interface ProjectStore {
  projects: Project[];
  selectedProject: Project | null;

  // Observables
  setProjects: (projects: Project[]) => void;
  selectProject: (id: string) => void;

  // Subscriptores automáticos via hook
}

const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  selectedProject: null,

  setProjects: (projects) => set({ projects }),

  selectProject: (id) => {
    const project = get().projects.find(p => p.id === id);
    set({ selectedProject: project });
  },
}));

// Componentes se suscriben automáticamente
function ProjectList() {
  const projects = useProjectStore(state => state.projects);  // Observer
  // Se re-renderiza automáticamente cuando projects cambia
}
```

### 5. Decorator Pattern (Backend)

```typescript
// Backend: Decoradores para logging, caching, validación
export function LogExecution() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      console.log(`Executing ${propertyKey} with args:`, args);
      const result = await originalMethod.apply(this, args);
      console.log(`${propertyKey} completed`);
      return result;
    };

    return descriptor;
  };
}

export class ProjectService {
  @LogExecution()  // Decorator pattern
  async create(dto: CreateProjectDto): Promise<ProjectEntity> {
    return await this.projectRepo.save(dto);
  }
}
```

---

## 🧪 TESTABILIDAD

### Principios de Código Testeable

```yaml
Código testeable debe ser:
  - Modular: Funciones pequeñas con responsabilidad única
  - Desacoplado: Sin dependencias directas (usar DI)
  - Determinista: Mismo input = mismo output
  - Sin efectos secundarios ocultos
```

### ✅ Código Testeable

```typescript
// Backend: Fácil de testear
export class ProjectService {
  constructor(
    private projectRepo: IProjectRepository,  // Mock fácil
    private logger: ILogger,                   // Mock fácil
  ) {}

  async create(dto: CreateProjectDto): Promise<ProjectEntity> {
    const project = ProjectFactory.create(dto, 'user-123');
    return await this.projectRepo.save(project);
  }
}

// Test
describe('ProjectService', () => {
  let service: ProjectService;
  let mockRepo: jest.Mocked<IProjectRepository>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockRepo = { save: jest.fn() } as any;
    mockLogger = { log: jest.fn(), error: jest.fn() } as any;
    service = new ProjectService(mockRepo, mockLogger);
  });

  it('should create project', async () => {
    mockRepo.save.mockResolvedValue({ id: '123' } as any);

    const result = await service.create({ code: 'PRJ-001', name: 'Test' });

    expect(result.id).toBe('123');
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });
});
```

### ❌ Código Difícil de Testear

```typescript
// ❌ Difícil de testear
export class ProjectService {
  async create(dto: CreateProjectDto): Promise<ProjectEntity> {
    // ❌ Dependencia directa - no se puede mockear
    const repo = new ProjectRepository();

    // ❌ Efecto secundario oculto
    console.log('Creating project');

    // ❌ Lógica de negocio mezclada con infraestructura
    const project = new ProjectEntity();
    project.code = dto.code;
    project.createdAt = new Date();  // ❌ No determinista

    // ❌ Conexión directa a BD
    return await repo.save(project);
  }
}
```

---

## 📏 CLEAN CODE

### Nomenclatura

```yaml
Variables y funciones:
  - Nombres descriptivos (no abreviaturas)
  - camelCase para variables/funciones
  - PascalCase para clases/interfaces
  - UPPER_SNAKE_CASE para constantes

✅ Correcto:
  - projectRepository (clara)
  - calculateTotalPrice (descriptiva)
  - MAX_RETRY_ATTEMPTS (constante)
  - IProjectService (interface)

❌ Incorrecto:
  - pr (ambigua)
  - calcPrice (abreviada)
  - maxRetry (incompleta)
  - projectservice (sin PascalCase)
```

### Funciones Pequeñas

```typescript
// ✅ Función pequeña con responsabilidad única
function calculateProjectPrice(project: Project): number {
  const basePrice = project.basePrice;
  const tax = calculateTax(basePrice);
  return basePrice + tax;
}

function calculateTax(amount: number): number {
  return amount * 0.16;
}

// ❌ Función grande con múltiples responsabilidades
function processProject(project: Project): void {
  // Validación
  if (!project.code) throw new Error('Code required');
  if (!project.name) throw new Error('Name required');

  // Cálculo
  const basePrice = project.basePrice;
  const tax = basePrice * 0.16;
  const total = basePrice + tax;

  // Persistencia
  db.save(project);

  // Notificación
  sendEmail(project);

  // Logging
  console.log('Project processed');
}
```

### Comentarios Útiles

```typescript
// ✅ Comentarios que agregan valor
/**
 * Calcula el precio total incluyendo IVA (16%)
 *
 * Nota: Para proyectos en zona fronteriza, el IVA es 8%
 * TODO: Implementar lógica de zona fronteriza
 *
 * @param project - Proyecto con basePrice definido
 * @returns Precio total con IVA
 */
function calculateTotalPrice(project: Project): number {
  const IVA_RATE = 0.16;  // 16% IVA estándar
  return project.basePrice * (1 + IVA_RATE);
}

// ❌ Comentarios inútiles
function calculateTotalPrice(project: Project): number {
  // Obtener precio base
  const base = project.basePrice;  // ❌ Obvio por el código

  // Multiplicar por 1.16
  return base * 1.16;  // ❌ Obvio por el código
}
```

### Evitar Números Mágicos

```typescript
// ✅ Constantes con nombres descriptivos
const IVA_RATE = 0.16;
const MAX_PROJECT_NAME_LENGTH = 200;
const DAYS_TO_ARCHIVE = 90;

function calculatePrice(basePrice: number): number {
  return basePrice * (1 + IVA_RATE);
}

function isNameValid(name: string): boolean {
  return name.length <= MAX_PROJECT_NAME_LENGTH;
}

// ❌ Números mágicos
function calculatePrice(basePrice: number): number {
  return basePrice * 1.16;  // ❌ ¿Qué es 1.16?
}

function isNameValid(name: string): boolean {
  return name.length <= 200;  // ❌ ¿Por qué 200?
}
```

---

## 🚨 CODE SMELLS A EVITAR

### 1. Código Duplicado

```typescript
// ❌ Duplicado
function calculateProjectPrice(project: Project): number {
  return project.basePrice * 1.16;
}

function calculateDevelopmentPrice(development: Development): number {
  return development.basePrice * 1.16;  // ❌ Duplicado
}

// ✅ DRY (Don't Repeat Yourself)
const IVA_RATE = 0.16;

function applyTax(basePrice: number): number {
  return basePrice * (1 + IVA_RATE);
}

function calculateProjectPrice(project: Project): number {
  return applyTax(project.basePrice);
}

function calculateDevelopmentPrice(development: Development): number {
  return applyTax(development.basePrice);
}
```

### 2. Funciones Largas

```yaml
Regla: Función no debe superar 20-30 líneas

Si es más larga: Dividir en subfunciones
```

### 3. Clases God Object

```typescript
// ❌ God Object - hace demasiado
class ProjectManager {
  validateProject() {}
  saveProject() {}
  calculatePrice() {}
  generateReport() {}
  sendNotification() {}
  logActivity() {}
  archiveProject() {}
  // ... 20 métodos más
}

// ✅ Separar responsabilidades
class ProjectValidator {
  validate(project: Project): boolean {}
}

class ProjectService {
  save(project: Project): Promise<Project> {}
}

class ProjectPricingService {
  calculatePrice(project: Project): number {}
}

class ProjectReportService {
  generateReport(project: Project): Buffer {}
}
```

### 4. Feature Envy

```typescript
// ❌ ProjectService "envidia" datos de Development
class ProjectService {
  calculateDevelopmentArea(development: Development): number {
    // ❌ Lógica que debería estar en Development o DevelopmentService
    return development.length * development.width * development.floors;
  }
}

// ✅ Lógica donde corresponde
class Development {
  calculateArea(): number {
    return this.length * this.width * this.floors;
  }
}

class ProjectService {
  calculateProjectArea(project: Project): number {
    return project.developments.reduce((sum, dev) =>
      sum + dev.calculateArea(), 0
    );
  }
}
```

### 5. Primitive Obsession

```typescript
// ❌ Uso excesivo de primitivos
function createProject(
  code: string,
  name: string,
  lat: number,
  lng: number,
  status: string,  // ❌ String en lugar de enum
): Project {}

// ✅ Value Objects
enum ProjectStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

class Coordinates {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number,
  ) {
    if (latitude < -90 || latitude > 90) {
      throw new Error('Invalid latitude');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Invalid longitude');
    }
  }
}

function createProject(
  code: string,
  name: string,
  coordinates: Coordinates,
  status: ProjectStatus,
): Project {}
```

---

## ✅ CHECKLIST DE CALIDAD

### Antes de Commitear

```markdown
- [ ] ¿Sigue principios SOLID?
- [ ] ¿Funciones < 30 líneas?
- [ ] ¿Nombres descriptivos (no abreviaturas)?
- [ ] ¿Sin código duplicado?
- [ ] ¿Sin números mágicos?
- [ ] ¿Comentarios solo donde agregan valor?
- [ ] ¿Testeable (DI, sin dependencias directas)?
- [ ] ¿Sin code smells evidentes?
- [ ] ¿Compila sin errores ni warnings?
- [ ] ¿Tests pasan (si existen)?
```

### Code Review Checklist

```markdown
- [ ] ¿Cumple con estándares de nomenclatura?
- [ ] ¿Usa patrones de diseño apropiados?
- [ ] ¿Maneja errores correctamente?
- [ ] ¿Tiene cobertura de tests adecuada?
- [ ] ¿Documentación/JSDoc presente?
- [ ] ¿Performance aceptable?
- [ ] ¿Sin vulnerabilidades de seguridad?
```

---

## 📚 REFERENCIAS

- [Clean Code - Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Design Patterns](https://refactoring.guru/design-patterns)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

**Versión:** 1.0.0
**Fecha:** 2025-11-20
**Próxima revisión:** Al identificar necesidad de mejoras
**Responsable:** Backend-Agent, Frontend-Agent
