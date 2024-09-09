import express, { Response, Request, NextFunction } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import errorHandler from './middlewares/globalErrorHandler';

const app = express();

app.get('/', (req, res) => {
  const error = createHttpError(400, 'something bad happened');
  throw error;
});

//Error handling global
app.use(errorHandler);

export default app;
