import { OAuth2Client } from 'google-auth-library';
import { GoogleVerifyError } from '../../Errors/errors.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyAndGetData(googleAccessToken: string) {
  const ticket = await client.verifyIdToken({
    idToken: googleAccessToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email_verified || !payload.email || !payload.name) {
    throw new GoogleVerifyError();
  }
  return payload;
}
