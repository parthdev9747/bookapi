import { Request, NextFunction, Response } from 'express';
import createHttpError from 'http-errors';
import { verify } from 'jsonwebtoken';
import { config } from '../config/config';
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(createHttpError(401, 'Unauthenticated'));
  }

  try {
    const decodedToken = verify(token, config.jwtSecret as string) as JwtPayload;
    req.userId = decodedToken.userId;

    next();
  } catch (error) {
    return next(createHttpError(401, 'Token expired!'));
  }
};

export default authenticate;
