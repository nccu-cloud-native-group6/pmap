import { userService } from '../../../../Infrastructure/Service/userService.js';

import { auth } from '../../../../utils/jwt.js';
import { signUpRes } from './signUpRes.js';
import { Signup } from './Types/api.js';
import { tool } from '../../../../utils/tool.js';

export const signUpHandler = {
  handle: async (body: Signup.TSignUpReq): Promise<Signup.ISignUpResponse> => {
    if (body.provider !== 'native') {
      const result = await userService.oauthSignUp(
        body.email ?? '',
        body.name ?? '',
        body.provider ?? '',
        body.avatar ?? '',
      );
      const tokenInfo = await auth.generateAccessToken(result);
      return await signUpRes.customize(result, tokenInfo);
    }
    const hashedPassword = await tool.generateHashPassword(
      body.password as string,
    );
    body.password = hashedPassword;

    const result = await userService.signUp(body);

    const tokenInfo = await auth.generateAccessToken(result);

    return signUpRes.customize(result, tokenInfo);
  },
};
