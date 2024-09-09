import Validator from 'validatorjs';

export class ValidationError extends Error {
  errors: Validator.ValidationErrors;

  constructor(message: string, errors: Validator.ValidationErrors) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export function validate(data: any, rules: Validator.Rules): void {
  const validation = new Validator(data, rules);

  if (validation.fails()) {
    throw new ValidationError('Validation failed', validation.errors.all());
  }
}
