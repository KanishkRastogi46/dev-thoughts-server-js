import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { Response } from 'express'

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Roles } from 'src/common/enum/role.enum';
import { hashPassword } from 'src/utils/hash-password';
import { AuthRepository } from './auth.repository';
import { comparePassword } from 'src/utils/compare-password';
import { generateToken } from 'src/utils/generate-token';
import { generateCookie } from 'src/utils/generate-cookie';


@Injectable()
export class AuthService {
    constructor(
        private readonly logger: PinoLogger,
        private readonly configService: ConfigService,
        private readonly authRepository: AuthRepository
    ) {}

    async register(registerDto: RegisterDto): Promise<any> {
        try {
            if (registerDto.password !== registerDto.confirmPassword) {
                this.logger.warn('Password and confirm password do not match');
                throw new BadRequestException('Password and confirm password do not match');
            }
            const user = await this.authRepository.findUserByEmailOrUsername(registerDto.email, registerDto.username)

            if (user.length > 0) {
                this.logger.warn('User already exists with the provided email or username');
                throw new BadRequestException('User already exists with the provided email or username');
            }

            const hashedPassword = await hashPassword(registerDto.password)
            const newUser = {
                fullname: `${registerDto.firstName} ${registerDto.lastName}`,
                email: registerDto.email,
                phoneNo: registerDto.phoneNumber,
                username: registerDto.username,
                password: hashedPassword,
                role: Roles.USER,
                country: registerDto.country,
            }

            const userId = await this.authRepository.createNewUser(newUser)
            if (userId.length === 0) {
                this.logger.error('Failed to register user')
                throw new InternalServerErrorException('Failed to register user')
            }

            return userId[0]
        } catch (error) {
            this.logger.error('Error during user registration', error);
            throw new HttpException(error.message, error.status || 500);
        }
    }

    async login(res: Response, loginDto: LoginDto): Promise<any> {
        try {
            const user = await this.authRepository.findUserByEmailOrUsername(loginDto.identifier)
            if (user.length === 0) {
                this.logger.warn('Invalid credentials');
                throw new BadRequestException('Invalid credentials');
            }

            if (!await comparePassword(loginDto.password, user[0].password)) {
                this.logger.warn('Invalid credentials');
                throw new BadRequestException('Invalid credentials');
            }

            const accessToken = generateToken(
                { 
                    userId: user[0].id, 
                    role: user[0].role, 
                    email: user[0].email 
                },
                this.configService.get<string>('JWT_SECRET_KEY'),
                { 
                    algorithm: this.configService.get('JWT_ALGORITHM'),
                    expiresIn: 3600,
                    issuer: this.configService.get('JWT_ISSUER'),
                    audience: this.configService.get('JWT_AUDIENCE')
                }
            )

            generateCookie(
                res,
                'accessToken',
                accessToken,
                {
                    httpOnly: true,
                    secure: this.configService.get<string>('NODE_ENV') === 'production',
                    maxAge: this.configService.get<number>('JWT_EXPIRES_TIME'),
                    sameSite: true
                }
            )

            user[0].lastLogin = new Date()
            await this.authRepository.updatedLastLogin(user[0].id, user[0].lastLogin)

            return {
                message: 'Login successful',
                timestamp: new Date().toISOString(),
            }
        } catch (error: any) {
            this.logger.error('Error during user login', error.message);
            throw new HttpException(error.message, error.status || 500);
        }
    }
}
