import { User } from '../../../../../Database/entity/user.js';
declare namespace Signup {
  type TSignUpReq = Pick<User, 'name' | 'email' | 'password' | 'provider'>;

  interface ISignUpResponse {
    data: {
      accessToken: string;
      accessExpired: string;
      userId: number;
    };
  }
}
