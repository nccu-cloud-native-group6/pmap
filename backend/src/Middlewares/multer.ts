import multer from 'multer';
import { NextFunction, Request, Response } from 'express';

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback,
) => {
  if (file.mimetype.split('/')[0] === 'image') {
    callback(null, true);
  } else {
    callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
});

const multerErrorHandling = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).send({ error: 'File size too large!' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).send({ error: 'Too many files!' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).send({ error: 'File must be an image' });
    }
  } else {
    next(err);
  }
};

export { upload, multerErrorHandling };
