import { CreateUserUseCase } from '@modules/users/application/create-user.use-case';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUserByIdUseCase } from '@modules/users/application/get-user-by-id.use-case';
import { CurrentUser } from '@shared/security/infrastructure/current-user.decorator';
import { TokenPayload } from '@shared/token/domain/token.interface';
import { GetMeUseCase } from '@modules/users/application/get-me.use-case';
import { EditUserRequestDto } from '../dto/request/edit-user.request.dto';
import { EditUserUseCase } from '@modules/users/application/edit-user.use-case';

@Controller('users')
@ApiTags('Usuarios')
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly editUserUseCase: EditUserUseCase,
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

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener el mismo usuario' })
  @ApiResponse({ type: () => UserResponseDto })
  async getMe(@CurrentUser() currentUser: TokenPayload): Promise<UserResponseDto> {
    const output = await this.getMeUseCase.execute({ user: currentUser });
    return UserResponseDto.fromEntity(output.user);
  }

  @Get('/:id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un usuario por id' })
  @ApiResponse({ type: () => UserResponseDto })
  async getById(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: (_errors) => new BadRequestException('El Id debe ser un UUID válido'),
      }),
    )
    id: string,
  ): Promise<UserResponseDto> {
    const output = await this.getUserByIdUseCase.execute({ id: id });
    return UserResponseDto.fromEntity(output.user);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Edición de un usuario' })
  @ApiBody({ type: () => EditUserRequestDto })
  @ApiResponse({ type: () => UserResponseDto })
  async edit(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
        exceptionFactory: (_errors) => new BadRequestException('El Id debe ser un UUID válido'),
      }),
    )
    id: string,
    @CurrentUser() currentUser: TokenPayload,
    @Body() dto: EditUserRequestDto,
  ) {
    const output = await this.editUserUseCase.execute({
      targetUserId: id,
      requestingUser: currentUser,
      name: dto.name,
      password: dto.password,
      role: dto.role,
    });
    return UserResponseDto.fromEntity(output.user);
  }
}
