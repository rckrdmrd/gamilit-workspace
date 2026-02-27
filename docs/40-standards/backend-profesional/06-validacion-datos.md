---
titulo: Estandar Backend Profesional - Validacion de Datos
tipo: estandar-proyecto
subtipo: backend-profesional
version: 1.0.0
fecha_creacion: 2026-02-02
ultima_actualizacion: 2026-02-27
---

# Estandar Backend Profesional - Validacion de Datos

> **Parte de:** [Estandar Backend Profesional](./_INDEX.md) | **Seccion 6 de 8**

## 6. Validacion de Datos

### 6.1 Class-Validator Decorators

```typescript
// application/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  Matches,
  IsPhoneNumber,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail({}, { message: 'Formato de email invalido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8, { message: 'La contrasena debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contrasena no puede exceder 50 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    { message: 'La contrasena debe contener mayusculas, minusculas, numeros y caracteres especiales' },
  )
  password: string;

  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El nombre solo puede contener letras y espacios',
  })
  name: string;

  @ApiPropertyOptional({ example: '+52 55 1234 5678' })
  @IsOptional()
  @IsPhoneNumber('MX', { message: 'Numero de telefono invalido para Mexico' })
  phoneNumber?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  @IsEnum(UserRole, { message: 'Rol invalido' })
  role: UserRole;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiPropertyOptional({ type: [String], example: ['tag1', 'tag2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10, { message: 'Maximo 10 tags permitidos' })
  tags?: string[];
}

export class AddressDto {
  @ApiProperty({ example: 'Av. Principal 123' })
  @IsString()
  @MinLength(5, { message: 'La calle debe tener al menos 5 caracteres' })
  street: string;

  @ApiProperty({ example: 'Ciudad de Mexico' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'CDMX' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '01234' })
  @IsString()
  @Matches(/^\d{5}$/, { message: 'El codigo postal debe tener 5 digitos' })
  zipCode: string;
}
```

### 6.2 Custom Validators

```typescript
// common/validators/is-unique.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [entityClass, property] = args.constraints;
    const repository = this.dataSource.getRepository(entityClass);

    const existingEntity = await repository.findOne({
      where: { [property]: value },
    });

    return !existingEntity;
  }

  defaultMessage(args: ValidationArguments): string {
    const [, property] = args.constraints;
    return `El valor de ${property} ya existe`;
  }
}

export function IsUnique(
  entityClass: Function,
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entityClass, property],
      validator: IsUniqueConstraint,
    });
  };
}

// common/validators/is-date-before.validator.ts
@ValidatorConstraint({ async: false })
export class IsDateBeforeConstraint implements ValidatorConstraintInterface {
  validate(value: Date, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];

    if (!value || !relatedValue) return true;

    return value < relatedValue;
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints;
    return `La fecha debe ser anterior a ${relatedPropertyName}`;
  }
}

export function IsDateBefore(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsDateBeforeConstraint,
    });
  };
}

// Uso
export class CreateEventDto {
  @IsDate()
  @Type(() => Date)
  @IsDateBefore('endDate', { message: 'La fecha de inicio debe ser anterior a la fecha de fin' })
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;
}

export class RegisterUserDto {
  @IsEmail()
  @IsUnique(UserOrmEntity, 'email', { message: 'Este email ya esta registrado' })
  email: string;
}
```

### 6.3 Validacion de DTOs en Pipeline

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Elimina propiedades no decoradas
      forbidNonWhitelisted: true,   // Error si hay propiedades extra
      transform: true,              // Transforma tipos automaticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map(error => ({
          field: error.property,
          constraints: Object.values(error.constraints || {}),
        }));
        return new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Error de validacion',
          errors: formattedErrors,
        });
      },
    }),
  );

  await app.listen(3000);
}

// Respuesta de error de validacion
{
  "code": "VALIDATION_ERROR",
  "message": "Error de validacion",
  "errors": [
    {
      "field": "email",
      "constraints": ["Formato de email invalido"]
    },
    {
      "field": "password",
      "constraints": [
        "La contrasena debe tener al menos 8 caracteres",
        "La contrasena debe contener mayusculas, minusculas, numeros y caracteres especiales"
      ]
    }
  ],
  "timestamp": "2026-02-02T10:30:00.000Z"
}
```

### Checklist Validacion

- [ ] DTOs con decoradores de validacion apropiados
- [ ] Mensajes de error claros y en espanol
- [ ] ValidationPipe global configurado
- [ ] Custom validators para reglas de negocio
- [ ] Validacion de objetos anidados con @ValidateNested
- [ ] Whitelist habilitado para seguridad
