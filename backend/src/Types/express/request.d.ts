import { Pmap } from '../common.js';

declare module 'express-serve-static-core' {
  interface Request {
    decodedToken?: Pmap.TJwtTokenPayload;
  }
}
