import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let msg =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    if (typeof msg === 'object' && 'message' in msg) {
      response.status(status).json({
        statusCode: status,
        error: msg.message,
        timestamp: new Date().toISOString(),
      });
    }

    response.status(status).json({
      statusCode: status,
      error: msg,
      timestamp: new Date().toISOString(),
    });
  }
}
