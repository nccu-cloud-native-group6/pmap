import { Request, Response } from 'express';
// import { googleOauthHandler } from '../App/Features/User/GoogleOauth/googleOauthHandler.js';
// import url from 'url';
import { InputEmptyError } from '../Errors/errors.js';
import { signUpHandler } from '../App/Features/User/SignUp/signUpHandler.js';
import { signInHandler } from '../App/Features/User/SignIn/signInHandler.js';

export const authController = {
  // googleOauth: async (req: Request, res: Response): Promise<void> => {
  //   let q = url.parse(req.url, true).query;
  //   if (q.error) {
  //     throw new Error('Error:' + q.error);
  //   }
  //   console.log(q.code);
  //   const response = await googleOauthHandler.handle(q.code as string);
  //   res.status(200).json(response);
  // },
  signUp: async (req: Request, res: Response): Promise<void> => {
    console.log(req.body);
    const { provider, email, name } = req.body;
    if (!email || !name || !provider) {
      throw new InputEmptyError();
    }
    console.log(provider);

    const response = await signUpHandler.handle(req.body);
    res.status(200).json(response);
  },
  signIn: async (req: Request, res: Response): Promise<void> => {
    console.log(req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      throw new InputEmptyError();
    }

    const response = await signInHandler.handle(email, password);
    res.status(200).json(response);
  },
};
