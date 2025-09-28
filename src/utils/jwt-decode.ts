import { verify } from 'jsonwebtoken';

export function decodeToken(token: string, secret: string) {
  return verify(token, secret);
}
