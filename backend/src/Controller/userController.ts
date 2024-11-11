import { Request, Response } from 'express';
import { InputEmptyError } from '../Errors/errors.js';
import { signUpHandler } from '../App/Features/User/SignUp/signUpHandler.js';

export const userController = {
  signUp: async (req: Request, res: Response): Promise<void> => {
    console.log(req.body);
    const { provider, email, password, name } = req.body;
    if (!email || !password || !name || !provider) {
      throw new InputEmptyError();
    }
    console.log(provider);

    const response = await signUpHandler.handle(req.body);
    res.status(200).json(response);
  },
};
