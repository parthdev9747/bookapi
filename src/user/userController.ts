import { NextFunction, Request, Response } from 'express';
import { validate, ValidationError } from '../utils/validator';
import bcrypt from 'bcrypt';
import userModel from './userModel';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { User } from './userType';

// Add Swagger documentation for createUser
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Email already exists or validation failed
 *       500:
 *         description: Internal server error
 */
const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Define validation rules
    const rules = {
      name: 'required|string|min:3|max:30',
      email: 'required|email',
      password: 'required|string|min:8|max:30',
    };

    // Validate request body
    validate(req.body, rules);

    const { name, email, password } = req.body;

    try {
      const user = await userModel.findOne({ email });

      if (user) {
        const error = createHttpError(400, 'Email already exists!');
        return next(error);
      }
    } catch (error) {
      return next(createHttpError(500, 'Something went wrong'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser: User;

    try {
      newUser = await userModel.create({
        ...req.body,
        password: hashedPassword,
      });
    } catch (error) {
      return next(createHttpError(500, 'Error while creating user'));
    }

    try {
      // Generate token

      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email },
        config.jwtSecret as string,
        { expiresIn: '7d' },
      );

      res.json({
        message: 'New user created successfully',
        data: {
          accessToken: token,
        },
      });
    } catch (error) {
      return next(createHttpError(500, 'Error while creating token'));
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

// Add Swagger documentation for loginUser
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: User or password not match
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rules = {
      email: 'required|email',
      password: 'required',
    };

    validate(req.body, rules);

    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return next(createHttpError(404, 'User not found!'));
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return next(createHttpError(400, 'User or password not match!'));
    }

    const token = jwt.sign({ userId: user._id }, config.jwtSecret as string, { expiresIn: '7d' });

    res.json({
      message: 'User logged in successfully',
      data: {
        accessToken: token,
      },
    });
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

export { createUser, loginUser };
