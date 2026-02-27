---
titulo: Error BE-003 Validación Faltante en DTOs
tipo: guia
dominio: troubleshooting
ultima_actualizacion: 2026-02-27
---

# ERR-BE-003: Validacion Faltante en DTOs

**Categoria:** Backend
**Severidad:** Alta
**Ocurrencias:** 7+
**Fecha documentacion:** 2025-12-28

---

## Descripcion

DTOs sin decoradores de validacion de class-validator permiten datos
invalidos que causan errores en capas posteriores.

---

## Sintoma

- Errores 500 en lugar de 400 Bad Request
- Datos invalidos almacenados en BD
- Mensajes de error poco claros para el usuario
- Vulnerabilidades de inyeccion

---

## Causa Raiz

DTOs creados sin decoradores de validacion:

```typescript
// PROBLEMATICO: Sin validacion
export class CreateUserDto {
  email: string;
  password: string;
  age: number;
}
```

---

## Solucion

### 1. Agregar decoradores de validacion

```typescript
import { IsEmail, IsString, MinLength, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email debe ser valido' })
  email: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'Password debe tener minimo 8 caracteres' })
  password: string;

  @ApiProperty({ minimum: 5, maximum: 100 })
  @IsInt()
  @Min(5)
  @Max(100)
  age: number;
}
```

### 2. Habilitar ValidationPipe global

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,  // Remueve propiedades no definidas
  forbidNonWhitelisted: true,  // Error si hay propiedades extra
  transform: true,  // Transforma tipos automaticamente
}));
```

### 3. Validaciones custom

```typescript
@ValidatorConstraint({ async: false })
export class IsValidUUIDConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      .test(value);
  }
}
```

---

## Prevencion

- Template de DTO con validaciones basicas
- Lint rule para DTOs sin decoradores
- Tests unitarios de validacion

---

## Decoradores Comunes

| Decorador | Uso |
|-----------|-----|
| @IsString() | Campos de texto |
| @IsEmail() | Emails |
| @IsUUID() | UUIDs |
| @IsInt() / @IsNumber() | Numeros |
| @MinLength() / @MaxLength() | Longitud strings |
| @IsOptional() | Campos opcionales |
| @IsEnum() | Valores de enum |

---

## Referencias

- NestJS Validation: https://docs.nestjs.com/techniques/validation
- class-validator: https://github.com/typestack/class-validator
