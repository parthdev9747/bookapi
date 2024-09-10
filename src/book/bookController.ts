import { NextFunction, Request, Response } from 'express';
import { validate, ValidationError, validateFiles } from '../utils/validator';
import createHttpError from 'http-errors';
import bookModel from './bookModel';
import { uploadToCloudinary } from '../utils/functions';

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

export { createBook };
