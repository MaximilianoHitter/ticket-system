import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@ticketapp/shared-types';
import { ROLES_KEY } from './roles.decorator';
import { TokenPayload } from '../../token/domain/token.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // el endpoint no declaró @Roles(), no restringe por rol
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as TokenPayload;

    return requiredRoles.includes(user.role);
  }
}
