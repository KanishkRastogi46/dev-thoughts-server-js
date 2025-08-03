import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { decodeToken } from "src/utils/jwt-decode";
import { JwtPayload } from "src/services/auth/interface/jwt-payload.interface";

@Injectable()
export class ProtectedRoutesMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        try {
            const publicRoutes = [
                "/",
                '/auth/login',
                '/auth/register',
                '/auth/forgot-password',
                '/auth/reset-password',
                '/auth/verify-email',
                '/auth/resend-verify-email',
                '/auth/refresh-token',
            ]

            const url = req.url
            const isPublicRoute = publicRoutes.some(path => url.includes(path))
            if (isPublicRoute) {
                next()
            } else {
                const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1]
                if (!token) {
                    throw new UnauthorizedException('Unauthorized')
                }
                const decoded = decodeToken(token, process.env.JWT_SECRET) as JwtPayload
                req.user = decoded
                next()
            }
        } catch (error) {
            throw new UnauthorizedException(error.message)
        }
    }
}