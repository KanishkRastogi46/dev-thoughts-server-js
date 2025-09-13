import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { decodeToken } from 'src/utils/jwt-decode';
import { JwtPayload } from 'src/services/auth/interface/jwt-payload.interface';
import { HttpClientService } from 'src/utils/http-client.service';
import { generateCookie } from 'src/utils/generate-cookie';
import { ConfigService } from '@nestjs/config';
import { routes } from 'src/common/api-route';

@Injectable()
export class ProtectedRoutesMiddleware implements NestMiddleware {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpClientService: HttpClientService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const publicRoutes = [
        '/',
        '/auth/login',
        '/auth/register',
        '/auth/verify-otp',
        '/auth/resend-otp',
        '/auth/forgot-password',
        '/auth/new-password',
      ];

      const url = req.url;
      const isPublicRoute = publicRoutes.some((path) => url.includes(path));
      if (isPublicRoute) {
        next();
      } else {
        const token =
          req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
        if (!token) {
          const refreshToken =
            req.cookies.refreshToken || req.headers['x-refresh-token'];
          if (!refreshToken) {
            throw new UnauthorizedException('Please login again.');
          }
          const response = await this.httpClientService.apiCall(
            routes.AUTH,
            '/auth/refresh-token',
            'POST',
            {},
            { 'x-refresh-token': refreshToken },
          );
          if (response.status !== 200) {
            throw new UnauthorizedException(
              'Session expired. Please login again.',
            );
          }

          const { userId, role, email, accessToken } = response.data;
          req.user = { id: userId, role };

          res.clearCookie('accessToken');
        } else {
          const decoded = decodeToken(
            token,
            process.env.JWT_SECRET,
          ) as JwtPayload;

          const expiryTime = decoded.exp * 1000;
          const bufferTime = 2 * 60 * 1000;
          if (Date.now() > expiryTime - bufferTime) {
            const response = await this.httpClientService.apiCall(
              routes.AUTH,
              '/auth/refresh-token',
              'POST',
              { userId: decoded.userId },
              { Authorization: `Bearer ${token}` },
            );
            if (response.status !== 200) {
              throw new UnauthorizedException(
                'Session expired. Please login again.',
              );
            }
            const newAccessToken = response.data.accessToken;

            res.clearCookie('accessToken');
            generateCookie(res, 'accessToken', newAccessToken, {
              httpOnly: true,
              secure: this.configService.get('NODE_ENV') === 'production',
              sameSite: 'lax',
              maxAge: parseInt(process.env.JWT_EXPIRY_TIME) * 1000,
            });
          }

          req.user = {
            id: decoded.userId,
            role: decoded.role,
          };
        }
        next();
      }
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
