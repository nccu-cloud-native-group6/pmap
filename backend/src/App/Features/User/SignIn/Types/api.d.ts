import { User } from '../../../../../Database/entity/user.js';
declare namespace Signin {
  interface ISignInDto extends Pick<User, 'id' | 'email'> {
    password: string | null;
    image: string | null;
    name: string;
  }

  interface ISignInResponse {
    data: {
      accessToken: string;
      accessExpired: string;
      user: {
        image: string;
        name: string;
        id: number;
        email: string;
      };
    };
  }
}
