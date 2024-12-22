import { JwtPayload } from 'jsonwebtoken';
declare namespace Pmap {
  type TJwtTokenPayload = JwtPayload & {
    id: number;
  };

  interface IJwtTokenObject {
    token: string;
    expire: string;
  }
  // 如果之後要其他的 oauth再加
  type TProvider = 'native' | 'google' | 'github';
}
