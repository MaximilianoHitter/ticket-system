import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationRequestDto } from '@shared/dto/request/pagination.request.dto';
import { Role } from '@ticketapp/shared-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ListUsersRequestDto extends PaginationRequestDto {
  @IsOptional()
  @IsEnum(Role)
  @ApiPropertyOptional({
    type: () => Role,
    description: 'Role',
    enum: Role,
  })
  role?: Role;

  @IsOptional()
  @IsString({ message: 'El filtro debe ser alfanumérico' })
  @ApiPropertyOptional({
    type: 'string',
    description: 'Email parcial o total',
  })
  email?: string;
}
