import { NextFunction, Request, Response } from 'express';
import { BaseError } from '../Errors/errors.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof BaseError) {
    console.error('Error catched ->', err);
    res.status(err.statusCode).send({ error: err.message });
  } else {
    console.error('Unknown error catched ->', err);
    res.status(501).send({ error: 'Internal Server Error' });
  }
}
