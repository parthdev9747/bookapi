import { NextFunction, Request, Response } from 'express';
import { validate, ValidationError, validateFiles } from '../utils/validator';
import createHttpError from 'http-errors';
import bookModel from './bookModel';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/functions';

/**
 * @swagger
 * /books/create:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     security:
 *       - jwt: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               genre:
 *                 type: string
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: New book added successfully
 *       400:
 *         description: Invalid file upload or validation failed
 *       500:
 *         description: Error while creating book
 */
const createBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rules = {
      title: 'required|string|min:3|max:30',
      genre: 'required|string|min:3|max:30',
    };

    await validate(req.body, rules);

    const rulesFiles: { [key: string]: string[] } = {
      coverImage: ['required', 'image', 'mimes:jpg,png'],
      file: ['required', 'file', 'mimes:pdf'],
    };

    if (!req.files || Array.isArray(req.files)) {
      return next(createHttpError(400, 'Invalid file upload'));
    }

    await validateFiles(req.files, rulesFiles);

    const { title, genre } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    try {
      const coverImageUploadResult = await uploadToCloudinary(files.coverImage[0], 'book-cover');
      const bookFileUploadResult = await uploadToCloudinary(files.file[0], 'book-pdf', 'raw');

      const newBook = await bookModel.create({
        title,
        genre,
        author: req.userId,
        coverImage: coverImageUploadResult.secure_url,
        file: bookFileUploadResult.secure_url,
      });

      return res.status(201).json({
        message: 'New book added successfully',
        id: newBook._id,
      });
    } catch (error) {
      return next(createHttpError(500, 'error while creating book'));
    }
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

/**
 * @swagger
 * /books/update/{id}:
 *   put:
 *     summary: Update an existing book
 *     tags: [Books]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the book to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               genre:
 *                 type: string
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       404:
 *         description: Book not found
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Error updating book
 */
const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const bookId = req.params.id;

  try {
    const rules = {
      title: 'required|string|min:3|max:30',
      genre: 'required|string|min:3|max:30',
    };

    await validate(req.body, rules);

    const book = await bookModel.findById(bookId);

    if (!book) {
      return next(createHttpError(404, 'Book not found!'));
    }

    if (book.author.toString() !== req.userId) {
      return next(createHttpError(403, 'Unauthorized'));
    }

    let coverImage;
    let bookFile;

    if (files?.coverImage) {
      await deleteFromCloudinary(book.coverImage, 'image');
      coverImage = await uploadToCloudinary(files.coverImage[0], 'book-cover');
    }
    if (files?.file) {
      await deleteFromCloudinary(book.file, 'raw');
      bookFile = await uploadToCloudinary(files.file[0], 'book-pdf', 'raw');
    }

    try {
      const updateBook = await bookModel.findOneAndUpdate(
        { _id: bookId },
        {
          title,
          genre,
          coverImage: coverImage ? coverImage.secure_url : book.coverImage,
          file: bookFile ? bookFile.secure_url : book.file,
        },
        { new: true },
      );

      return res.status(200).json(updateBook);
    } catch (error) {
      return next(createHttpError(500, 'Error updating book'));
    }
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

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Retrieve a list of books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: A list of books
 *       500:
 *         description: Error getting books
 */
const listBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await bookModel.find();

    return res.status(200).json(books);
  } catch (error) {
    return next(createHttpError(500, 'Error getting books'));
  }
};

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Retrieve a single book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the book to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single book
 *       404:
 *         description: Book not found
 *       500:
 *         description: Error getting book
 */
const singleBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookId = req.params.id;

    const book = await bookModel.findOne({ _id: bookId });

    if (!book) {
      return next(createHttpError(404, 'Book not found'));
    }

    return res.status(200).json(book);
  } catch (error) {
    return next(createHttpError(500, 'Error getting book'));
  }
};

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book by ID
 *     tags: [Books]
 *     security:
 *       - jwt: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the book to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 *       403:
 *         description: Unauthorized
 *       500:
 *         description: Error deleting book
 */
const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookId = req.params.id;

    const book = await bookModel.findOne({ _id: bookId });

    if (!book) {
      return next(createHttpError(404, 'Book not found'));
    }

    if (book.author.toString() !== req.userId) {
      return next(createHttpError(403, 'Unauthorized'));
    }

    await deleteFromCloudinary(book.coverImage, 'image');
    await deleteFromCloudinary(book.file, 'raw');

    await bookModel.findByIdAndDelete({ _id: bookId });

    return res.sendStatus(204);
  } catch (error) {
    return next(createHttpError(500, 'Error deleting book'));
  }
};

export { createBook, updateBook, listBook, singleBook, deleteBook };
