import { User } from '../../../../../Database/entity/user.js';
declare namespace Signin {
  interface ISignInDto extends Pick<User, 'id' | 'email'> {
    password: string | null;
  }

  interface ISignInResponse {
    data: {
      accessToken: string;
      accessExpired: string;
      user: {
        id: number;
        email: string;
      };
    };
  }
}
