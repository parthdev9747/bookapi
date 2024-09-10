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

export function validateFiles(
  files: { [fieldname: string]: Express.Multer.File[] },
  rules: { [key: string]: string[] },
): void {
  const errors: Validator.ValidationErrors = {};

  for (const [fieldname, fileRules] of Object.entries(rules)) {
    const file = files[fieldname]?.[0];

    if (!file && fileRules.includes('required')) {
      errors[fieldname] = ['The ' + fieldname + ' field is required.'];
      continue;
    }

    if (file) {
      const mimeType = file.mimetype;
      const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

      if (fileRules.includes('image') && !mimeType.startsWith('image/')) {
        errors[fieldname] = ['The ' + fieldname + ' must be an image.'];
      }

      if (fileRules.includes('file') && !mimeType.startsWith('application/')) {
        errors[fieldname] = ['The ' + fieldname + ' must be a file.'];
      }

      const allowedMimes = fileRules
        .find((rule) => rule.startsWith('mimes:'))
        ?.split(':')[1]
        .split(',');

      if (allowedMimes && !allowedMimes.includes(fileExtension || '')) {
        errors[fieldname] = [
          'The ' + fieldname + ' must be a file of type: ' + allowedMimes.join(', ') + '.',
        ];
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}
