# Estandar Backend Profesional - Domain-Driven Design (DDD) Basico

> **Parte de:** [Estandar Backend Profesional](./_INDEX.md) | **Seccion 4 de 8**

---

## 4. Domain-Driven Design (DDD) Basico

### 4.1 Entities vs Value Objects

| Caracteristica | Entity | Value Object |
|----------------|--------|--------------|
| Identidad | Tiene ID unico | Sin identidad propia |
| Igualdad | Por ID | Por valores |
| Mutabilidad | Puede cambiar estado | Inmutable |
| Ciclo de vida | Independiente | Pertenece a Entity |
| Ejemplo | User, Order, Product | Email, Money, Address |

```typescript
// Entity: Tiene identidad unica
export class Product {
  private constructor(
    private readonly _id: ProductId,
    private _name: string,
    private _price: Money,
    private _stock: number,
  ) {}

  // Dos productos son iguales si tienen el mismo ID
  equals(other: Product): boolean {
    return this._id.equals(other._id);
  }

  // Puede cambiar su estado
  updatePrice(newPrice: Money): void {
    if (newPrice.amount <= 0) {
      throw new InvalidPriceError('El precio debe ser mayor a 0');
    }
    this._price = newPrice;
  }

  decreaseStock(quantity: number): void {
    if (quantity > this._stock) {
      throw new InsufficientStockError(this._id.value, quantity, this._stock);
    }
    this._stock -= quantity;
  }
}

// Value Object: Inmutable, igualdad por valores
export class Money {
  private constructor(
    private readonly _amount: number,
    private readonly _currency: Currency,
  ) {}

  static create(amount: number, currency: Currency): Money {
    if (amount < 0) {
      throw new InvalidAmountError('El monto no puede ser negativo');
    }
    return new Money(amount, currency);
  }

  // Dos Money son iguales si tienen mismos valores
  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  // Operaciones retornan nuevos objetos (inmutabilidad)
  add(other: Money): Money {
    if (!this._currency.equals(other._currency)) {
      throw new CurrencyMismatchError();
    }
    return new Money(this._amount + other._amount, this._currency);
  }

  multiply(factor: number): Money {
    return new Money(this._amount * factor, this._currency);
  }

  get amount(): number { return this._amount; }
  get currency(): Currency { return this._currency; }
}

// Value Object compuesto
export class Address {
  private constructor(
    private readonly _street: string,
    private readonly _city: string,
    private readonly _state: string,
    private readonly _zipCode: string,
    private readonly _country: string,
  ) {}

  static create(props: AddressProps): Address {
    this.validate(props);
    return new Address(
      props.street,
      props.city,
      props.state,
      props.zipCode,
      props.country,
    );
  }

  private static validate(props: AddressProps): void {
    if (!props.street || props.street.length < 5) {
      throw new InvalidAddressError('Calle invalida');
    }
    if (!props.zipCode || !/^\d{5}$/.test(props.zipCode)) {
      throw new InvalidAddressError('Codigo postal invalido');
    }
    // ... mas validaciones
  }

  equals(other: Address): boolean {
    return (
      this._street === other._street &&
      this._city === other._city &&
      this._state === other._state &&
      this._zipCode === other._zipCode &&
      this._country === other._country
    );
  }

  format(): string {
    return `${this._street}, ${this._city}, ${this._state} ${this._zipCode}, ${this._country}`;
  }
}
```

### 4.2 Aggregates

**Regla:** Un Aggregate es un cluster de objetos de dominio tratados como una unidad.

```typescript
// Order es el Aggregate Root
export class Order {
  private constructor(
    private readonly _id: OrderId,
    private readonly _customerId: CustomerId,
    private _items: OrderItem[],
    private _status: OrderStatus,
    private _shippingAddress: Address,
    private readonly _createdAt: Date,
  ) {}

  static create(props: CreateOrderProps): Order {
    if (props.items.length === 0) {
      throw new EmptyOrderError();
    }

    const order = new Order(
      OrderId.generate(),
      CustomerId.fromString(props.customerId),
      [],
      OrderStatus.PENDING,
      Address.create(props.shippingAddress),
      new Date(),
    );

    // Items se agregan a traves del aggregate root
    props.items.forEach(item => order.addItem(item));

    return order;
  }

  // Todas las modificaciones pasan por el Aggregate Root
  addItem(props: AddItemProps): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new OrderNotModifiableError(this._id.value);
    }

    const existingItem = this._items.find(i => i.productId === props.productId);
    if (existingItem) {
      existingItem.increaseQuantity(props.quantity);
    } else {
      this._items.push(OrderItem.create(props));
    }
  }

  removeItem(productId: string): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new OrderNotModifiableError(this._id.value);
    }

    const index = this._items.findIndex(i => i.productId === productId);
    if (index === -1) {
      throw new ItemNotFoundError(productId);
    }

    this._items.splice(index, 1);

    if (this._items.length === 0) {
      throw new EmptyOrderError();
    }
  }

  confirm(): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new InvalidOrderTransitionError(this._status, OrderStatus.CONFIRMED);
    }
    this._status = OrderStatus.CONFIRMED;
  }

  ship(): void {
    if (this._status !== OrderStatus.CONFIRMED) {
      throw new InvalidOrderTransitionError(this._status, OrderStatus.SHIPPED);
    }
    this._status = OrderStatus.SHIPPED;
  }

  cancel(): void {
    if (this._status === OrderStatus.SHIPPED || this._status === OrderStatus.DELIVERED) {
      throw new OrderCannotBeCancelledError(this._id.value, this._status);
    }
    this._status = OrderStatus.CANCELLED;
  }

  // Calculos delegados dentro del aggregate
  calculateTotal(): Money {
    return this._items.reduce(
      (total, item) => total.add(item.calculateSubtotal()),
      Money.create(0, Currency.USD),
    );
  }

  get id(): string { return this._id.value; }
  get customerId(): string { return this._customerId.value; }
  get items(): readonly OrderItem[] { return [...this._items]; }
  get status(): OrderStatus { return this._status; }
  get shippingAddress(): Address { return this._shippingAddress; }
  get createdAt(): Date { return this._createdAt; }
}

// OrderItem pertenece al aggregate Order
export class OrderItem {
  private constructor(
    private readonly _productId: string,
    private readonly _productName: string,
    private readonly _unitPrice: Money,
    private _quantity: number,
  ) {}

  static create(props: CreateOrderItemProps): OrderItem {
    if (props.quantity <= 0) {
      throw new InvalidQuantityError();
    }
    return new OrderItem(
      props.productId,
      props.productName,
      Money.create(props.unitPrice, Currency.USD),
      props.quantity,
    );
  }

  increaseQuantity(amount: number): void {
    if (amount <= 0) {
      throw new InvalidQuantityError();
    }
    this._quantity += amount;
  }

  calculateSubtotal(): Money {
    return this._unitPrice.multiply(this._quantity);
  }

  get productId(): string { return this._productId; }
  get productName(): string { return this._productName; }
  get unitPrice(): Money { return this._unitPrice; }
  get quantity(): number { return this._quantity; }
}
```

### 4.3 Domain Services

**Regla:** Logica de dominio que no pertenece naturalmente a ninguna entidad.

```typescript
// Domain Service para transferencia entre cuentas
@Injectable()
export class MoneyTransferService {
  async transfer(
    fromAccount: Account,
    toAccount: Account,
    amount: Money,
  ): Promise<TransferResult> {
    // Validacion de negocio
    if (fromAccount.currency !== toAccount.currency) {
      throw new CurrencyMismatchError();
    }

    if (!fromAccount.canWithdraw(amount)) {
      throw new InsufficientFundsError(fromAccount.id, amount);
    }

    // Operacion atomica entre dos entidades
    fromAccount.withdraw(amount);
    toAccount.deposit(amount);

    return {
      success: true,
      fromBalance: fromAccount.balance,
      toBalance: toAccount.balance,
      transferredAmount: amount,
    };
  }
}

// Domain Service para calculo de precios
@Injectable()
export class PricingService {
  calculateOrderPrice(
    order: Order,
    customer: Customer,
    promotions: Promotion[],
  ): PriceCalculation {
    const subtotal = order.calculateTotal();

    // Aplicar descuento por nivel de cliente
    const customerDiscount = this.calculateCustomerDiscount(customer, subtotal);

    // Aplicar promociones
    const promotionDiscount = this.calculatePromotionDiscount(promotions, subtotal);

    // Calcular impuestos
    const taxableAmount = subtotal.subtract(customerDiscount).subtract(promotionDiscount);
    const tax = this.calculateTax(taxableAmount, order.shippingAddress);

    // Total final
    const total = taxableAmount.add(tax);

    return {
      subtotal,
      customerDiscount,
      promotionDiscount,
      tax,
      total,
    };
  }

  private calculateCustomerDiscount(customer: Customer, amount: Money): Money {
    const discountRate = customer.loyaltyTier.discountRate;
    return amount.multiply(discountRate);
  }

  private calculatePromotionDiscount(promotions: Promotion[], amount: Money): Money {
    const applicablePromotions = promotions.filter(p => p.isApplicable(amount));
    return applicablePromotions.reduce(
      (discount, promo) => discount.add(promo.calculateDiscount(amount)),
      Money.create(0, amount.currency),
    );
  }

  private calculateTax(amount: Money, address: Address): Money {
    const taxRate = this.getTaxRate(address);
    return amount.multiply(taxRate);
  }

  private getTaxRate(address: Address): number {
    // Logica de determinacion de impuestos por region
    return 0.16; // 16% IVA
  }
}
```

### Checklist DDD

- [ ] Entities tienen identidad unica y comportamiento
- [ ] Value Objects son inmutables y comparados por valores
- [ ] Aggregates encapsulan invariantes de negocio
- [ ] Solo el Aggregate Root es accesible externamente
- [ ] Domain Services para logica que cruza multiples entidades
- [ ] Lenguaje ubicuo reflejado en el codigo
