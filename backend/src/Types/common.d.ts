import { JwtPayload } from 'jsonwebtoken';
declare namespace Pmap {
  type TJwtTokenPayload = JwtPayload & {
    id: string;
  };

  interface IJwtTokenObject {
    token: string;
    expire: string;
  }
}
