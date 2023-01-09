import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtGuard, RolesGuard } from '../guards';
import { Role } from '../enums/roles.enum';
import { Roles } from './roles.decorator';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(JwtGuard, RolesGuard),
    // ApiBearerAuth(),
    // ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}