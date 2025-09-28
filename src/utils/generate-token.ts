import { sign, SignOptions } from 'jsonwebtoken';

export function generateToken(
  payload: any,
  secret: string,
  options: SignOptions,
) {
  const accessToken = sign(payload, secret, options);
  return accessToken;
}
