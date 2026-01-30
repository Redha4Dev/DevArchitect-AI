import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { AppError } from '../utils/AppError.js';
import { User } from '../models/userModel.js';

export const authMiddelware = async (req: Request, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    //@ts-ignore
    req.user = await User.findById(decoded.id).select('-password'); 
    
    next();
  } catch (error) {
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
};