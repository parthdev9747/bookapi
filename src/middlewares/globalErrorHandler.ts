import { Response, Request, NextFunction } from 'express';
import { HttpError } from 'http-errors';
import { config } from '../config/config';

const errorHandler = (error: HttpError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    message: error.message,
    errorStack: config.env === 'dev' ? error.stack : null,
  });
};

export default errorHandler;
