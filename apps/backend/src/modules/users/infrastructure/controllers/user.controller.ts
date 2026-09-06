import { CreateUserUseCase } from '@modules/users/application/create-user.use-case';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/security/infrastructure/jwt-auth.guard';
import { Roles } from '@shared/security/infrastructure/roles.decorator';
import { RolesGuard } from '@shared/security/infrastructure/roles.guard';
import { Role } from '@ticketapp/shared-types';
import { CreateUserRequestDto } from '../dto/request/create-user.request.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post('/')
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateUserRequestDto): Promise<UserResponseDto> {
    const output = await this.createUserUseCase.execute(dto.toInput());
    return UserResponseDto.fromOutput(output);
  }
}
