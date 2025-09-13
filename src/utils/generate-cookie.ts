import { CookieOptions, Response } from 'express';

export const generateCookie = (
  res: Response,
  key: string,
  value: string,
  options: CookieOptions,
) => {
  res.cookie(key, value, options);
};
