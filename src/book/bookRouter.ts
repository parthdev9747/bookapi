import express from 'express';
import upload from '../utils/multerConfig';
import { createBook } from './bookController';

const bookRouter = express.Router();

bookRouter.post(
  '/create',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  createBook,
);

export default bookRouter;
