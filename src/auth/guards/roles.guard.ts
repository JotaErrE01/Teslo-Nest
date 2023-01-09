import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/roles.enum';
import { User } from '../entities/user.entity';
import { ROLES_KEY } from '../decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const { user }: { user: User } = context.switchToHttp().getRequest();

    if(!requiredRoles.length) return true;
    const validUser = requiredRoles.some(role => user.roles?.includes(role));

    if(validUser)
      return true;
    
    throw new ForbiddenException('No tienes permisos para acceder a este recurso');
  }
}