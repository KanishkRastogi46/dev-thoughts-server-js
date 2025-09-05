import { HttpException, HttpStatus, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule, PinoLogger } from 'nestjs-pino';
import * as z from 'zod'
import { configSchema } from './common/config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { AuthModule } from './services/auth/auth.module';
import { ProfileModule } from './services/profile/profile.module';
import { ProtectedRoutesMiddleware } from './middlewares/protected-routes.middleware';
import { correlationIdMiddleware } from './middlewares/correlation-id.middleware';
import { HttpClientService } from './utils/http-client.service';

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
				customProps: (req) => ({
					context: 'HTTP',
					correlationId: req.headers['x-correlation-id'],
					requestId: req.id,
					method: req.method,
					url: req.url,
					service: 'user-service',
				}),
				level: process.env.LOG_LEVEL || (process.env.NODE_ENV !== 'production' ? 'debug' : 'info'),
				redact: {
					paths: [
						'req.headers["access-token"]',
						'req.headers.authorization',
						'req.headers.cookie',
						'req.headers["x-api-key"]',
						'req.headers["x-correlation-id"]',
						'req.body.password',
						'req.body.token',
						'req.body.admin_access_token',
						'req.body.refresh_token',
						'res.headers["set-cookie"]',
					],
					remove: true,
				},
				transport:
					process.env.NODE_ENV !== 'production'
						? {
								target: 'pino-pretty',
								options: {
									singleLine: true,
									colorize: true,
									translateTime: "yyyy-MM-dd'T'HH:mm:ss.l'Z'",
									messageFormat:
										'{correlationId} [{context}] {method} {url} - {msg} {responseTime}ms',
									ignore: 'pid,hostname',
								},
							}
						: undefined,
				serializers: {
					req: (req) => ({
						id: req.id,
						method: req.method,
						url: req.url,
						route: req.route?.path,
						parameters: {
							query: req.query,
							params: req.params,
						},
						headers: {
							'x-correlation-id': req.headers['x-correlation-id'],
							'user-agent': req.headers['user-agent'],
							'content-type': req.headers['content-type'],
							'user-id': req.headers['x-user-id'],
						},
					}),
					res: (res) => ({
						statusCode: res.statusCode,
						responseTime: res.responseTime,
					}),
					err: (err) => ({
						type: err.type,
						message: err.message,
						stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
						code: err.code,
						statusCode: err.statusCode,
					}),
				},
				timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
				customLogLevel: (_req, res, err) => {
					if (res?.statusCode >= 500 || err) {
						return 'error'
					}
					if (res?.statusCode >= 400) {
						return 'warn'
					}
					return 'info'
				},
				customSuccessMessage: (req, res) => {
					if (res.statusCode === 404) {
						return 'Resource not found'
					}
					return `${req.method} completed`
				},
				customErrorMessage: (_req, _res, err) => {
					return `Request failed: ${err?.message || 'Unknown error'}`
				},
				wrapSerializers: true,
			},
    }),
    DrizzleModule,
    AuthModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [
	AppService, 
	PinoLogger,
    HttpClientService,
],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ProtectedRoutesMiddleware, correlationIdMiddleware)
      .forRoutes('*')
  }
}
