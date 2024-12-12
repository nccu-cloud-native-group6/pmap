// import { userService } from '../../../../Infrastructure/Service/userService.js';
// import { auth } from '../../../../utils/jwt.js';
// import { verifyAndGetData } from '../../../../Database/serviceClient/googleOauth.js';
// import { googleOauthRes } from './googleOauthRes.js';
// import { GoogleVerifyError } from '../../../../Errors/errors.js';
// export const googleOauthHandler = {
//   handle: async (code: string): Promise<GoogleOauth.IGoogleOauthResponse> => {
//     const userInfo = await verifyAndGetData(code);
//     console.log(`Hello, ${userInfo.name} ${userInfo.email}!`);
//     if( !userInfo ) {
//       throw new GoogleVerifyError()
//     }

//     console.log("lib success");
//     const result = await userService.oauthSignUp(
//       userInfo.email as string,
//       userInfo.name as string,
//       'google',
//     );

//     const tokenInfo = await auth.generateAccessToken(result);

//     return googleOauthRes.customize(result, tokenInfo);
//   },
// };
