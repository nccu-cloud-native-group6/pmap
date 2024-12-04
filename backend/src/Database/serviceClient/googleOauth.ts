import { OAuth2Client } from 'google-auth-library';
import { GoogleVerifyError } from '../../Errors/errors.js';

let client: OAuth2Client;
console.log('test');
export async function verifyAndGetData(googleAccessToken: string) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error(
      'GOOGLE_CLIENT_ID is not defined in environment variables.',
    );
  }

  if (!client) {
    client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: googleAccessToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (
      !payload ||
      !payload.email_verified ||
      !payload.email ||
      !payload.name
    ) {
      throw new GoogleVerifyError();
    }
    return payload;
  } catch (error) {
    console.error('Error verifying Google ID token:', error);
    throw new GoogleVerifyError();
  }
}
