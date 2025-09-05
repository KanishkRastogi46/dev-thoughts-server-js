import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression'
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { GlobalInterceptor } from './common/interceptor/global.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true
  });

  const configService = app.get(ConfigService)
  const port: number = configService.get<number>('PORT')

  app.setGlobalPrefix('api/v1')
  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
    prefix: 'v'
  })
  app.use(cookieParser())
  app.use(compression())
  app.useLogger(app.get(Logger))

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }))
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalInterceptors(new GlobalInterceptor())

  const config = new DocumentBuilder()
    .setTitle('Dev Thoughts')
    .setDescription('This is the API documentation for Dev Thoughts')
    .setVersion('1.0')
    .addTag('developers')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
bootstrap();
