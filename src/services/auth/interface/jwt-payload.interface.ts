export interface JwtPayload {
  userId: string;
  role: number;
  email: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}
