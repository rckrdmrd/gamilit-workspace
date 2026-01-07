/**
 * Custom Validation Pipe
 *
 * Enhanced validation pipe with custom error messages.
 */

import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

// Type for class constructor
type ClassType<T = unknown> = new (...args: unknown[]) => T;

@Injectable()
export class CustomValidationPipe implements PipeTransform<unknown, Promise<unknown>> {
  async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Validation failed',
        errors: this.formatErrors(errors),
      });
    }

    return value;
  }

  private toValidate(metatype: ClassType): boolean {
    const types: ClassType[] = [String, Boolean, Number, Array, Object] as ClassType[];
    return !types.includes(metatype);
  }

  private formatErrors(errors: ValidationError[]): Array<{
    field: string;
    constraints: ValidationError['constraints'];
  }> {
    return errors.map((error) => ({
      field: error.property,
      constraints: error.constraints,
    }));
  }
}
