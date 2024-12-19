import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { NoTokenError } from '../Errors/errors.js';
import { isTJwtTokenPayload } from '../utils/jwt.js';
import logger from '../Logger/index.js';
const { TokenExpiredError, NotBeforeError, JsonWebTokenError } = jwt;

export const jwtAuthentication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization;
  try {
    if (!token) {
      throw new NoTokenError();
    }
    const pureToken = token.split(' ')[1];
    const decodedToken = jwt.verify(
      pureToken,
      process.env.JWT_SECRET as string,
    );
    if (isTJwtTokenPayload(decodedToken)) {
      req.decodedToken = decodedToken;
    } else {
      throw new JsonWebTokenError('Invalid token');
    }
    next();
  } catch (err) {
    if (err instanceof NoTokenError) {
      logger.error(err, 'No token');
      res.status(401).json({ message: err.message });
    } else if (err instanceof TokenExpiredError) {
      logger.error(err, 'Token expired');
      res.status(403).json({ message: err.message });
    } else if (err instanceof NotBeforeError) {
      logger.error(err, 'Token not active');
      res.status(403).json({ message: err.message });
    } else if (err instanceof JsonWebTokenError) {
      logger.error(err, 'Invalid token');
      res.status(403).json({ message: err.message });
    } else {
      logger.error(err, 'Unknown error');
      res.status(403).json({ message: 'An unknown error occurred' });
    }
  }
};
