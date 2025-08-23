import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';

@Controller({ path: 'auth' })
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(
        @Body() registerDto: RegisterDto,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const newUser = await this.authService.register(registerDto)
        return res.status(201).json({
            message: 'User registered successfully',
            user: newUser
        });
    }

    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Req() req: Request,
        @Res() res: Response
    ) {
        const loginResponse = await this.authService.login(res, loginDto)
        return res.status(200).json(loginResponse);
    }
}
