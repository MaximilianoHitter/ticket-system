import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  data: T[];
  @ApiProperty({ type: 'number', description: 'Total' })
  total!: number;
  @ApiProperty({ type: 'number', description: 'Página' })
  page!: number;
  @ApiProperty({ type: 'number', description: 'Límite' })
  limit!: number;
  @ApiProperty({ type: 'number', description: 'Cantidad de páginas' })
  totalPages!: number;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}

export function ApiPaginatedResponse<TModel extends Type<unknown>>(model: TModel) {
  class PaginatedResponseModel extends PaginatedResponseDto<TModel> {
    @ApiProperty({ type: [model] })
    declare data: TModel[];
  }
  Object.defineProperty(PaginatedResponseModel, 'name', {
    value: `Paginated${model.name}`,
  });
  return PaginatedResponseModel;
}
