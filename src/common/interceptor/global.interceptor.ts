import { BadGatewayException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap, map, catchError, throwError } from 'rxjs';

@Injectable()
export class GlobalInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        console.log(`Request processed in ${responseTime}ms`);
      }),
      map((data) => {
        return {
          data,
          timestamp: new Date().toISOString(),
        }
      }),
      catchError((err) => throwError(() => new BadGatewayException(err.message)))
    );
  }
}
