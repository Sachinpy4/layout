import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    // Check if user has required permissions
    // The JWT should contain the role with permissions populated
    const userPermissions = user.role?.permissions || user.permissions || [];
    const userRoleName = user.role?.name || user.role;

    // Check if user has any of the required roles/permissions
    return requiredRoles.some((requiredRole) => {
      // First check if it's a direct role name match (for backwards compatibility)
      if (userRoleName === requiredRole) {
        return true;
      }
      
      // Then check if user has the permission in their role's permissions array
      if (Array.isArray(userPermissions) && userPermissions.includes(requiredRole)) {
        return true;
      }
      
      // Check individual permissions array if it exists on user
      if (Array.isArray(user.permissions) && user.permissions.includes(requiredRole)) {
        return true;
      }
      
      return false;
    });
  }
} 