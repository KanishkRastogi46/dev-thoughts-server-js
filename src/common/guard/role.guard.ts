import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RoleNames } from '../enum/role.enum';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly availableRoles = Object.values(RoleNames);

  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const userRoles = (request.user.role as string).split(',') as RoleNames[];

      if (!userRoles || userRoles.length === 0) return false;

      const roles = this.reflector.get<RoleNames[]>(
        'roles',
        context.getHandler(),
      );

      if (!roles || roles.length === 0) return false;

      const requiredRoles = roles.filter((role) =>
        this.availableRoles.includes(role),
      );
      if (requiredRoles.length === 0) return false;
      for (const role of userRoles) {
        if (!requiredRoles.includes(role)) {
          return false;
        }
      }
      return true;
    } catch (error) {
      throw new ForbiddenException('Access Denied');
    }
  }
}
