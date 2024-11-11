import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { NoTokenError } from '../Errors/errors.js';
import { isTJwtTokenPayload } from '../utils/jwt.js';
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
      console.error('No token:', err);
      res.status(401).json({ message: err.message });
    } else if (err instanceof TokenExpiredError) {
      console.error('Token expired:', err);
      res.status(403).json({ message: err.message });
    } else if (err instanceof NotBeforeError) {
      console.error('Token not active:', err);
      res.status(403).json({ message: err.message });
    } else if (err instanceof JsonWebTokenError) {
      console.error('Invalid token:', err);
      res.status(403).json({ message: err.message });
    } else {
      console.error('Unknown error:', err);
      res.status(403).json({ message: 'An unknown error occurred' });
    }
  }
};
