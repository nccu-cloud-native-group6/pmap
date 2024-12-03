import { Pmap } from '../../../../Types/common.js';
export const googleOauthRes = {
  customize: async (
    newUserId: number,
    tokenInfo: Pmap.IJwtTokenObject,
  ): Promise<GoogleOauth.IGoogleOauthResponse> => {
    return {
      data: {
        accessToken: tokenInfo.token,
        accessExpired: tokenInfo.expire,
        userId: newUserId,
      },
    };
  },
};
