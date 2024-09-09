import { NextFunction, Request, Response } from 'express';
import { validate, ValidationError } from '../utils/validator';

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Define validation rules
    const rules = {
      username: 'required|string|min:3|max:30',
      email: 'required|email',
      password: 'required|string|min:8|max:30',
    };

    // Validate request body
    validate(req.body, rules);

    res.json({
      message: 'New user created',
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.errors,
      });
    }
    next(error);
  }
};

export { createUser };
