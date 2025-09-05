import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { RolesDecorator } from 'src/common/decorator/roles.decorators';
import { RoleNames } from 'src/common/enum/role.enum';
import { RoleGuard } from 'src/common/guard/role.guard';

@Controller({ path: 'auth' })
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body() registerDto: RegisterDto,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const newUser = await this.authService.register(registerDto)
        res.setHeader('X-User-Id', newUser);
        return res.status(201).json({
            message: 'User registered successfully',
            user: newUser
        });
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const loginResponse = await this.authService.login(res, loginDto)
        return res.status(200).json(loginResponse);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    async validateOtp(
        @Body() otpDto: { otp: string },
        @Req() req: Request,
        @Res() res: Response
    ) {
        const userId = parseInt(req.headers['x-user-id'] as string)
        const validateOtpResponse = await this.authService.validateOtp(userId, otpDto.otp)
        if (validateOtpResponse) {
            return res.status(200).json({
                message: 'Otp validated successfully'
            });
        } else {
            return res.status(400).json({
                message: 'Invalid otp'
            });
        }
    }

    @Post('logout')
    @RolesDecorator([RoleNames.USER, RoleNames.ADMIN, RoleNames.SUPER_ADMIN])
    @UseGuards(RoleGuard)
    @HttpCode(HttpStatus.OK)
    async refreshToken(
        @Req() req: Request,
        @Res() res: Response
    ) {
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        res.status(200).json({
            message: 'Logged out successfully',
            timestamp: new Date().toISOString()
        })
    }

    @Post('resend-otp')
    @HttpCode(HttpStatus.OK)
    async resendOtp(
        @Req() req: Request,
        @Res() res: Response
    ) {
        const userId = parseInt(req.headers['x-user-id'] as string)
        const resendOtpResponse = await this.authService.resendOtp(userId)
        res.status(200).json(resendOtpResponse)
    }

    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshAuthToken(
        @Req() req: Request,
        @Res() res: Response
    ) {
        const accessToken = await this.authService.refreshToken(req)
        res.status(200).json(accessToken)
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(
        @Body() body: { email: string },
        @Req() req: Request,
        @Res() res: Response
    ) {
        const forgotPasswordResponse = await this.authService.forgotPassword(body.email)
        res.setHeader('X-User-Id', forgotPasswordResponse.userId);
        res.status(200).json(forgotPasswordResponse)
    }

    @Post('new-password')
    @HttpCode(HttpStatus.OK)
    async newPassword(
        @Body() body: { password: string },
        @Req() req: Request,
        @Res() res: Response
    ) {
        const userId = parseInt(req.headers['x-user-id'] as string)
        const newPasswordResponse = await this.authService.newPassword(userId, body.password)
        res.status(200).json(newPasswordResponse)
    }
}
