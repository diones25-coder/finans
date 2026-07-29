import { IsOptional, IsNumber, IsString, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'page deve ser maior ou igual a 1' })
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'pageSize deve ser maior ou igual a 1' })
  @Type(() => Number)
  pageSize?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
