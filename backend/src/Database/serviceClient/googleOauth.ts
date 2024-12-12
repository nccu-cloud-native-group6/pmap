// import { google } from 'googleapis';

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI,
// );
// export async function verifyAndGetData(grantCode: string) {
//   // 取得access token
//   let { tokens } = await oauth2Client.getToken(grantCode);
//   oauth2Client.setCredentials(tokens);
//   console.log('token', tokens);
//   const oauth2 = google.oauth2({
//     auth: oauth2Client,
//     version: 'v2',
//   });
//   const userInfo = await oauth2.userinfo.get();
//   return userInfo.data;
// }
