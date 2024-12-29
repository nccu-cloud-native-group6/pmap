import { Pmap } from '../../../../Types/common.js';
import { Signin } from './Types/api.js';
export const signInRes = {
  customize: async (
    userObj: Signin.ISignInDto,
    tokenInfo: Pmap.IJwtTokenObject,
  ): Promise<Signin.ISignInResponse> => {
    return {
      data: {
        accessToken: tokenInfo.token,
        accessExpired: tokenInfo.expire,
        user: {
          id: userObj.id,
          email: userObj.email,
          image: userObj.image ?? '',
          name: userObj.name,
        },
      },
    };
  },
};
