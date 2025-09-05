import { BadRequestException, HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import * as jwt from 'jsonwebtoken'

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Roles } from 'src/common/enum/role.enum';
import { hashPassword } from 'src/utils/hash-password';
import { AuthRepository } from './auth.repository';
import { comparePassword } from 'src/utils/compare-password';
import { generateToken } from 'src/utils/generate-token';
import { generateCookie } from 'src/utils/generate-cookie';
import { generateOTP } from 'src/utils/generate-otp';
import { MailService } from 'src/utils/email.service';
import { HttpClientService } from 'src/utils/http-client.service';


@Injectable()
export class AuthService {
    constructor(
        private readonly logger: PinoLogger,
        private readonly configService: ConfigService,
        private readonly authRepository: AuthRepository,
        private readonly httpClientService: HttpClientService
    ) {}

    /**
     * @description Registers a new user
     * @param registerDto - data transfer object for registering a new user
     * @returns userId: number
     */
    async register(registerDto: RegisterDto): Promise<number> {
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

            const otp = this.authRepository.createOtp(generateOTP(), userId[0].id, 'VERIFY ACCOUNT')
            if (this.configService.get('NODE_ENV') === 'production') {
                // an email with otp be sent for verification but not on 'dev' env
            }

            return userId[0].id
        } catch (error) {
            this.logger.error('Error during user registration', error);
            throw new HttpException(error.message, error.status || 500);
        }
    }

    /**
     * @description Logs in a user
     * @param res Express Response object
     * @param loginDto data transfer object for logging in a user
     * @returns 
     */
    async login(res: Response, loginDto: LoginDto): Promise<any> {
        try {
            const user = await this.authRepository.findUser(loginDto.identifier)
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
                    expiresIn: parseInt(this.configService.get('JWT_EXPIRY_TIME')),
                    issuer: this.configService.get('JWT_ISSUER'),
                    audience: this.configService.get('JWT_AUDIENCE')
                }
            )
            const refreshToken = generateToken(
                {
                    userId: user[0].id
                },
                this.configService.get<string>('JWT_REFRESH_SECRET_KEY'),
                {
                    algorithm: this.configService.get('JWT_ALGORITHM'),
                    expiresIn: parseInt(this.configService.get('JWT_REFRESH_EXPIRY_TIME')),
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
                    maxAge: this.configService.get<number>('JWT_EXPIRY_TIME') * 1000,
                    sameSite: true
                }
            )
            generateCookie(
                res,
                'refreshToken',
                refreshToken,
                {
                    httpOnly: true,
                    secure: this.configService.get<string>('NODE_ENV') === 'production',
                    maxAge: this.configService.get<number>('JWT_REFRESH_EXPIRY_TIME') * 1000,
                    sameSite: true
                }
            )

            const otp = this.authRepository.createOtp(generateOTP(), user[0].id, 'LOGIN')
            if (this.configService.get('NODE_ENV') === 'production') {
                // an email with otp be sent for verification but not on 'dev' env
            }

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

    /**
     * @description Validates the OTP for a user
     * @param userId number
     * @param otpValue string
     * @returns 
     */
    async validateOtp(userId: number, otpValue: string) {
        try {
            const otp = await this.authRepository.getOtp(userId)
            if (otp !== otpValue) {
                this.logger.error("Invalid OTP")
                return false
            }

            return true
        } catch (error: any) {
            console.log('error', error);
            this.logger.error("Error during while validating otp", error)
            throw new HttpException(error.message, error.status || 500)
        }
    }

    /**
     * @description Refreshes the access token using the refresh token and buffers time if access token is about to expire
     * @param req Express Request object
     * @returns 
     */
    async refreshToken(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>) {
        try {
            const { userId } = req.body
            if (userId) {
                const user = await this.authRepository.getUserById(userId)
                if (user.length === 0) {
                    this.logger.warn('User not found');
                    throw new BadRequestException('User not found');
                }

                const accessToken = req.cookies['accessToken'] || req.headers['authorization']?.split(' ')[1]
                if (accessToken) {
                    const newAccessToken = generateToken(
                        { 
                            userId: req.user['userId'], 
                            role: req.user['role'], 
                            email: req.user['email'] 
                        },
                        this.configService.get<string>('JWT_SECRET_KEY'),
                        { 
                            algorithm: this.configService.get('JWT_ALGORITHM'),
                            expiresIn: parseInt(this.configService.get('JWT_EXPIRY_TIME')),
                            issuer: this.configService.get('JWT_ISSUER'),
                            audience: this.configService.get('JWT_AUDIENCE')
                        }
                    )
                    req.res.clearCookie('accessToken')
                    generateCookie(
                        req.res,
                        'accessToken',
                        newAccessToken,
                        {
                            httpOnly: true,
                            secure: this.configService.get('NODE_ENV') === 'production',
                            sameSite: 'lax',
                            maxAge: parseInt(this.configService.get('JWT_EXPIRY_TIME')) * 1000,
                        }
                    )
                    return {
                        userId: user[0].id,
                        role: user[0].role,
                        email: user[0].email,
                        accessToken: newAccessToken
                    }
                }
            }

            const refreshToken = req.cookies['refreshToken'] || req.headers['x-refresh-token'] as string
            if (!refreshToken) {
                this.logger.warn('Refresh token not found');
                throw new UnauthorizedException('Session expired. Please login again.')
            }

            const decoded = jwt.verify(refreshToken, this.configService.get<string>('JWT_REFRESH_SECRET_KEY'))
            const user = await this.authRepository.getUserById(decoded['userId'])
            if (user.length === 0) {
                this.logger.warn('User not found');
                throw new BadRequestException('User not found');
            }
            const newAccessToken = generateToken(
                { 
                    userId: user[0].id, 
                    role: user[0].role, 
                    email: user[0].email 
                },
                this.configService.get<string>('JWT_SECRET_KEY'),
                { 
                    algorithm: this.configService.get('JWT_ALGORITHM'),
                    expiresIn: parseInt(this.configService.get('JWT_EXPIRY_TIME')),
                    issuer: this.configService.get('JWT_ISSUER'),
                    audience: this.configService.get('JWT_AUDIENCE')
                }
            )
            generateCookie(
                req.res,
                'accessToken',
                newAccessToken,
                {
                    httpOnly: true,
                    secure: this.configService.get('NODE_ENV') === 'production',
                    sameSite: 'lax',
                    maxAge: parseInt(this.configService.get('JWT_EXPIRY_TIME')) * 1000,
                }
            )
            return {
                userId: user[0].id,
                role: user[0].role,
                email: user[0].email,
                accessToken: newAccessToken
            }
        } catch (error) {
            throw new HttpException(error.message, error.status || 500)
        }
    }

    /**
     * @description Resends the OTP to the user if allowed
     * @param userId number
     * @returns 
     */
    async resendOtp(userId: number) {
        try {
            const canResendOtp = await this.authRepository.canResendOtp(userId)

            if (!canResendOtp) {
                this.logger.warn('Cannot resend otp now. Please try again later.')
                throw new BadRequestException('Cannot resend otp now. Please try again later.')
            }

            const newOtp = this.authRepository.resendOtp(userId, generateOTP())
            if (this.configService.get('NODE_ENV') === 'production') {
                // an email with otp be sent for verification but not on 'dev' env
            }

            return {
                message: 'Otp resent successfully',
                timestamp: new Date().toISOString()
            }
        } catch (error) {
            throw new HttpException(error.message || 'Otp can be send only thrice in 1 hour', error.status || 500)
        }
    }

    /**
     * @description Sends a password reset link to the user's email
     * @param email string
     * @returns 
     */
    async forgotPassword(email: string) {
        try {
            const user = await this.authRepository.findUser(email)

            if (user.length === 0) {
                this.logger.warn('User not found with the provided email');
                throw new BadRequestException('User not found with the provided email');
            }

            // send email for resetting password
            const hashEmail = hashPassword(user[0].email)

            return {
                message: 'Password reset link has been sent to your email',
                userId: user[0].id,
            }
        } catch (error) {
            throw new HttpException(error.message, error.status || 500)
        }
    }

    /**
     * @description Updates the user's password
     * @param userId number
     * @param newPassword string
     * @returns 
     */
    async newPassword(userId: number, newPassword: string) {
        try {
            const user = await this.authRepository.getUserById(userId)
            if (user.length === 0) {
                this.logger.warn('User not found');
                throw new BadRequestException('User not found');
            }
            const hashedPassword = await hashPassword(newPassword)
            await this.authRepository.updatePassword(userId, hashedPassword)
            return {
                message: 'Password updated successfully',
                timestamp: new Date().toISOString()
            }
        } catch (error) {
            throw new HttpException(error.message, error.status || 500)
        }
    }
}
