import { CreateUserUseCase } from '@modules/users/application/create-user.use-case';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@shared/security/infrastructure/jwt-auth.guard';
import { Roles } from '@shared/security/infrastructure/roles.decorator';
import { RolesGuard } from '@shared/security/infrastructure/roles.guard';
import { Role } from '@ticketapp/shared-types';
import { CreateUserRequestDto } from '../dto/request/create-user.request.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';
import { ListUsersRequestDto } from '../dto/request/list-users.request.dto';
import { PaginatedResponseDto } from '@shared/dto/response/paginated.response.dto';
import { ListUsersUseCase } from '@modules/users/application/list-users.use-case';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @Post('/')
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreateUserRequestDto): Promise<UserResponseDto> {
    const output = await this.createUserUseCase.execute(dto.toInput());
    return UserResponseDto.fromOutput(output);
  }

  @Get()
  @Roles(Role.ADMIN)
  async list(@Query() dto: ListUsersRequestDto): Promise<PaginatedResponseDto<UserResponseDto>> {
    const output = await this.listUsersUseCase.execute({
      skip: dto.getSkip(),
      take: dto.getTake(),
      role: dto.role,
      email: dto.email,
    });

    const usersDto = output.users.map((user) => UserResponseDto.fromEntity(user));

    return new PaginatedResponseDto(usersDto, output.total, dto.page, dto.limit);
  }
}
