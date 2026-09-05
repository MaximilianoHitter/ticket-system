import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/security/infrastructure/jwt-auth.guard';
import { Roles } from '@shared/security/infrastructure/roles.decorator';
import { RolesGuard } from '@shared/security/infrastructure/roles.guard';
import { Role } from '@ticketapp/shared-types';

@Controller('users')
export class UsersController {
  @Get('/')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getUsers() {
    return { message: 'Ok' };
  }
}
