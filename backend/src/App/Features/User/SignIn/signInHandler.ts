import { WrongPasswordError } from '../../../../Errors/errors.js';
import { userService } from '../../../../Infrastructure/Service/userService.js';

import { auth } from '../../../../utils/jwt.js';

import { tool } from '../../../../utils/tool.js';
import { signInRes } from './signInRes.js';

import { Signin } from './Types/api.js';

export const signInHandler = {
  handle: async (
    email: string,
    password: string,
  ): Promise<Signin.ISignInResponse> => {
    const result = await userService.signIn(email);
    if (!(await tool.confirmPassword(password, result.password as string)))
      throw new WrongPasswordError();

    const tokenInfo = await auth.generateAccessToken(result.id);

    return signInRes.customize(result, tokenInfo);
  },
};
