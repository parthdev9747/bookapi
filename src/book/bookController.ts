import express, { NextFunction, Request, Response } from 'express';
import { config } from '../config/config';
import createHttpError from 'http-errors';
import { Book } from './bookTypes';
import bookModel from './bookModel';

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req);
};

export { createBook };
