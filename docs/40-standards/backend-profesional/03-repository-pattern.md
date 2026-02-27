---
titulo: Estandar Backend Profesional - Repository Pattern
tipo: estandar-proyecto
subtipo: backend-profesional
version: 1.0.0
fecha_creacion: 2026-02-02
ultima_actualizacion: 2026-02-27
---

# Estandar Backend Profesional - Repository Pattern

> **Parte de:** [Estandar Backend Profesional](./_INDEX.md) | **Seccion 3 de 8**

## 3. Repository Pattern

### 3.1 Interfaz del Repository (Port)

```typescript
// domain/interfaces/repository.interface.ts

// Interfaz base generica
export interface IRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<void>;
  delete(id: ID): Promise<void>;
  exists(id: ID): Promise<boolean>;
}

// Interfaz especifica con metodos de dominio
export interface IOrderRepository extends IRepository<Order> {
  findByCustomerId(customerId: string): Promise<Order[]>;
  findByStatus(status: OrderStatus): Promise<Order[]>;
  findPendingOrdersOlderThan(date: Date): Promise<Order[]>;
  countByStatusAndPeriod(status: OrderStatus, from: Date, to: Date): Promise<number>;
}
```

### 3.2 Implementacion con TypeORM (Adapter)

```typescript
// infrastructure/repositories/typeorm-order.repository.ts
@Injectable()
export class TypeOrmOrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly repository: Repository<OrderOrmEntity>,
    private readonly mapper: OrderPersistenceMapper,
  ) {}

  async findById(id: string): Promise<Order | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['items', 'customer'],
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Order[]> {
    const entities = await this.repository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
    return entities.map(e => this.mapper.toDomain(e));
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const entities = await this.repository.find({
      where: { customerId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
    return entities.map(e => this.mapper.toDomain(e));
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    const entities = await this.repository.find({
      where: { status },
      relations: ['items'],
    });
    return entities.map(e => this.mapper.toDomain(e));
  }

  async findPendingOrdersOlderThan(date: Date): Promise<Order[]> {
    const entities = await this.repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.status = :status', { status: OrderStatus.PENDING })
      .andWhere('order.createdAt < :date', { date })
      .getMany();
    return entities.map(e => this.mapper.toDomain(e));
  }

  async countByStatusAndPeriod(
    status: OrderStatus,
    from: Date,
    to: Date,
  ): Promise<number> {
    return this.repository.count({
      where: {
        status,
        createdAt: Between(from, to),
      },
    });
  }

  async save(order: Order): Promise<void> {
    const entity = this.mapper.toOrmEntity(order);
    await this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }
}
```

### 3.3 Inyeccion de Dependencias

```typescript
// orders.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([OrderOrmEntity, OrderItemOrmEntity])],
  controllers: [OrderController],
  providers: [
    // Use Cases
    CreateOrderUseCase,
    GetOrderUseCase,
    CancelOrderUseCase,

    // Repository con token
    {
      provide: 'IOrderRepository',
      useClass: TypeOrmOrderRepository,
    },

    // Mapper
    OrderPersistenceMapper,
  ],
  exports: ['IOrderRepository'],
})
export class OrdersModule {}

// Uso en Use Case
@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(dto: CreateOrderDto): Promise<OrderResponseDto> {
    const order = Order.create({
      customerId: dto.customerId,
      items: dto.items.map(item => OrderItem.create(item)),
    });

    await this.orderRepository.save(order);

    return OrderMapper.toResponse(order);
  }
}
```

### Checklist Repository Pattern

- [ ] Interfaces definidas en Domain layer
- [ ] Implementaciones en Infrastructure layer
- [ ] Inyeccion mediante tokens de interfaz
- [ ] Mappers separados para Domain <-> ORM
- [ ] Queries complejas encapsuladas en metodos de repository
