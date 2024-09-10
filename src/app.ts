import express from 'express';
import errorHandler from './middlewares/globalErrorHandler';
import userRouter from './user/userRouter';
import path from 'path';

const app = express();

app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.use(express.json());

//Routes
app.use('/api/users', userRouter);

//Error handling global
app.use(errorHandler);

export default app;
