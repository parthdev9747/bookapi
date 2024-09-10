import express, { NextFunction, Request, Response } from 'express';
import { config } from '../config/config';
import createHttpError from 'http-errors';
import { Book } from './bookTypes';
import bookModel from './bookModel';
import path from 'path';
import { uploadToCloudinary } from '../utils/functions';

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const coverImageUploadResult = await uploadToCloudinary(files.coverImage[0], 'book-cover');
  const bookFileUploadResult = await uploadToCloudinary(files.file[0], 'book-pdf', 'raw');

  console.log('coverImageUploadResult', coverImageUploadResult);
  console.log('bookFileUploadResult', bookFileUploadResult);

  return res.json({
    data: null,
  });
};

export { createBook };
