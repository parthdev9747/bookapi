import express from 'express';
import upload from '../utils/multerConfig';
import { createBook, updateBook, listBook, singleBook, deleteBook } from './bookController';
import authenticate from '../middlewares/authenticate';

const bookRouter = express.Router();

bookRouter.get('/', listBook);

bookRouter.get('/:id', singleBook);

bookRouter.post(
  '/create',
  authenticate,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  createBook,
);

bookRouter.patch(
  '/update/:id',
  authenticate,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  updateBook,
);

bookRouter.delete('/:id', authenticate, deleteBook);

export default bookRouter;
