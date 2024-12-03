import axios from 'axios';
import { userService } from '../../../../Infrastructure/Service/userService.js';

import { auth } from '../../../../utils/jwt.js';
import { verifyAndGetData } from '../../../../Database/serviceClient/googleOauth.js';
import { googleOauthRes } from './googleOauthRes.js';

export const googleOauthHandler = {
  handle: async (code: string): Promise<GoogleOauth.IGoogleOauthResponse> => {
    const data: GoogleOauth.TAsRequestBody = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
      grant_type: 'authorization_code',
    };
    const response = await axios.post(
      process.env.GOOGLE_ACCESS_TOKEN_URL as string,
      data,
    );
    const { id_token } = response.data;
    console.log('id_token', id_token);

    // if eveything is ok, then get user data -> email , name
    const payload = await verifyAndGetData(id_token);

    const result = await userService.oauthSignUp(
      payload.email as string,
      payload.name as string,
      'google',
    );

    const tokenInfo = await auth.generateAccessToken(result);

    return googleOauthRes.customize(result, tokenInfo);
  },
};
