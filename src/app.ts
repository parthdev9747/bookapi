import express from 'express';
import errorHandler from './middlewares/globalErrorHandler';
import userRouter from './user/userRouter';
import path from 'path';
import bookRouter from './book/bookRouter';
import cors from 'cors';
import { config } from './config/config';
import setupSwagger from './config/swagger';

const app = express();

setupSwagger(app);

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(
  cors({
    origin: config.frontend_domain,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }),
);
app.use(express.json());

//Routes
app.use('/api/users', userRouter);
app.use('/api/books', bookRouter);

//Error handling global
app.use(errorHandler);

export default app;
