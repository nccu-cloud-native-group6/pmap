import { Request, Response, NextFunction } from 'express';

export default function wrapAsync(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return function (req: Request, res: Response, next: NextFunction) {
    fn(req, res, next).catch(next);
  };
}
