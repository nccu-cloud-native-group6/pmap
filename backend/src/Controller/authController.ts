import { Request, Response } from 'express';
import { OauthGrantCodeRequiredError } from '../Errors/errors.js';
import { googleOauthHandler } from '../App/Features/User/GoogleOauth/googleOauthHandler.js';

export const authController = {
  googleOauth: async (req: Request, res: Response): Promise<void> => {
    const { code } = req.query;
    if (!code) {
      throw new OauthGrantCodeRequiredError();
    }
    console.log(code);
    const response = await googleOauthHandler.handle(code as string);
    res.status(200).json(response);
  },
};
