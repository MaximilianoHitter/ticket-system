import { CreateUserUseCase } from '@modules/users/application/create-user.use-case';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@shared/security/infrastructure/jwt-auth.guard';
import { Roles } from '@shared/security/infrastructure/roles.decorator';
import { RolesGuard } from '@shared/security/infrastructure/roles.guard';
import { Role } from '@ticketapp/shared-types';
import { CreateUserRequestDto } from '../dto/request/create-user.request.dto';
import { UserResponseDto } from '../dto/response/user.response.dto';
import { ListUsersRequestDto } from '../dto/request/list-users.request.dto';
import {
  ApiPaginatedResponse,
  PaginatedResponseDto,
} from '@shared/dto/response/paginated.response.dto';
import { ListUsersUseCase } from '@modules/users/application/list-users.use-case';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('users')
@ApiTags('Usuarios')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @Post('/')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un usuario' })
  @ApiBody({ type: () => CreateUserRequestDto })
  @ApiResponse({ type: () => UserResponseDto })
  async create(@Body() dto: CreateUserRequestDto): Promise<UserResponseDto> {
    const output = await this.createUserUseCase.execute(dto.toInput());
    return UserResponseDto.fromOutput(output);
  }

  @Get()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Obtener listado de usuarios con paginación y filtro por role e email (parcial o total)',
  })
  @ApiOkResponse({ type: () => ApiPaginatedResponse(UserResponseDto) })
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
