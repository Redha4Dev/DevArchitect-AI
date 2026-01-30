import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js'; // Import real model
import { config } from '../config.js';
import { AppError } from '../utils/AppError.js';

const signToken = (id: string) => {
    //@ts-ignore
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }

    // Create User (Password hashing happens automatically in the model!)
    const newUser = await User.create({ username, email, password });

    const token = signToken(newUser.id);

    // Remove password from output
    newUser.password = undefined as any;

    res.status(201).json({
      status: 'success',
      token,
      data: { user: newUser }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email & password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // 2. Check if user exists & password is correct
    // We explicitly select +password because standard queries might exclude it
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(user.id);

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (err) {
    next(err);
  }
};