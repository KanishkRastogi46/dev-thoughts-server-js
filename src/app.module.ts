import { HttpException, HttpStatus, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule, PinoLogger } from 'nestjs-pino';
import * as z from 'zod'
import { configSchema } from './common/config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { AuthMiddleware } from './middlewares/auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, any>) => {
        const areEnvCorrect = z.safeParse(configSchema, config);
        if (!areEnvCorrect.success) {
          throw new HttpException(`Invalid environment variables: ${areEnvCorrect.error.message}`, HttpStatus.BAD_REQUEST);
        }
        return configSchema.parse(config);
      }
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        useLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        genReqId: (req) => req.headers['x-correlation-id'] || crypto.randomUUID(),
        transport: process.env.NODE_ENV === 'production' 
          ? undefined 
          : { target: 'pino-pretty',}
      }
    }),
    DrizzleModule
  ],
  controllers: [AppController],
  providers: [AppService, PinoLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude()
      .forRoutes('*'); // Apply AuthMiddleware to all routes
  }
}
