import express from 'express';
import errorHandler from './middlewares/globalErrorHandler';
import userRouter from './user/userRouter';

const app = express();

app.use(express.json());

//Error handling global
app.use(errorHandler);

//Routes
app.use('/api/users', userRouter);

export default app;
