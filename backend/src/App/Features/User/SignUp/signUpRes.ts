import { Signup } from './Types/api.js';
import { Pmap } from '../../../../Types/common.js';
export const signUpRes = {
  customize: async (
    newUserId: number,
    tokenInfo: Pmap.IJwtTokenObject,
  ): Promise<Signup.ISignUpResponse> => {
    return {
      data: {
        accessToken: tokenInfo.token,
        accessExpired: tokenInfo.expire,
        userId: newUserId,
      },
    };
  },
};
