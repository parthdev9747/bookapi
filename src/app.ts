import express from 'express';
import errorHandler from './middlewares/globalErrorHandler';
import userRouter from './user/userRouter';

const app = express();

app.use(express.json());

//Routes
app.use('/api/users', userRouter);

//Error handling global
app.use(errorHandler);

export default app;
