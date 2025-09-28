import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { AuthRepository } from './auth.repository';
import { MailService } from 'src/utils/email.service';
import { HttpClientService } from 'src/utils/http-client.service';

@Module({
  imports: [DrizzleModule],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, MailService, HttpClientService],
})
export class AuthModule {}
