import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { and, eq, or } from 'drizzle-orm';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Roles } from 'src/common/enum/role.enum';
import { hashPassword } from 'src/utils/hash-password';
import { AuthRepository } from './auth.repository';


@Injectable()
export class AuthService {
    constructor(
        private readonly logger: PinoLogger,
        private readonly configService: ConfigService,
        private readonly authRepository: AuthRepository
    ) {}

    async register(registerDto: RegisterDto): Promise<any> {
        try {
            const user = await this.authRepository.findUserByEmailOrUsername(registerDto.email, registerDto.username)

            if (user) {
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
            }

            const userId = await this.authRepository.createNewUser(newUser)
            if (userId.length === 0) {
                this.logger.error('Failed to register user')
                throw new InternalServerErrorException('Failed to register user')
            }
        } catch (error) {
            this.logger.error('Error during user registration', error);
            throw new InternalServerErrorException('Error during user registration');
        }
    }
}
