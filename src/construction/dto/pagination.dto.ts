import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'page deve ser maior ou igual a 1' })
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'page deve ser maior ou igual a 1' })
  @Type(() => Number)
  pageSize?: number;
}
