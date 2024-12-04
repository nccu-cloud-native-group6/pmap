import { userService } from '../../../../Infrastructure/Service/userService.js';
import { auth } from '../../../../utils/jwt.js';
import { verifyAndGetData } from '../../../../Database/serviceClient/googleOauth.js';
import { googleOauthRes } from './googleOauthRes.js';
import axios from 'axios';
export const googleOauthHandler = {
  handle: async (code: string): Promise<GoogleOauth.IGoogleOauthResponse> => {
    const {
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI,
      GOOGLE_ACCESS_TOKEN_URL,
    } = process.env;

    if (
      !GOOGLE_CLIENT_ID ||
      !GOOGLE_CLIENT_SECRET ||
      !GOOGLE_REDIRECT_URI ||
      !GOOGLE_ACCESS_TOKEN_URL
    ) {
      throw new Error(
        'One or more required environment variables are not defined.',
      );
    }
    console.log('GOOGLE_CLIENT_ID', GOOGLE_CLIENT_ID);
    const data: GoogleOauth.TAsRequestBody = {
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    };

    const response = await axios.post(GOOGLE_ACCESS_TOKEN_URL, data);
    const { id_token } = response.data;
    console.log('id_token', id_token);

    // if eveything is ok, then get user data -> email , name
    const payload = await verifyAndGetData(id_token);

    // const token_info_response = await axios.get(
    //   `${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${id_token}`
    // );
    // if (token_info_response.status !== 200) {
    //   throw new Error('Error getting token info');
    // }
    // const payload = token_info_response.data;

    // if(!payload.email_verified || !payload.email || !payload.name) {
    //   throw new Error('Should get email, name and email_verified data');
    // }
    const result = await userService.oauthSignUp(
      payload.email as string,
      payload.name as string,
      'google',
    );

    const tokenInfo = await auth.generateAccessToken(result);

    return googleOauthRes.customize(result, tokenInfo);
  },
};
