import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CreateSpentDto {
  @ApiProperty({ example: 4.5, description: 'Valor do gasto', minLength: 1 })
  @IsNumber({}, { message: 'O gasto deve ser um número válido' })
  @Min(1, { message: 'O gasto deve ser maior que zero' })
  value: number;

  @ApiProperty({
    example: 'Sorvete',
    description: 'Nome do gasto',
    minLength: 4,
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(4, { message: 'Nome deve ter no mínimo 4 caracteres' })
  description: string;

  @ApiProperty({
    example: '92385fb0-2ed3-4e13-8605-11fd0b4a201f',
    description: 'Categoria do gasto',
  })
  @IsString({ message: 'Id da categoria deve ser uma string' })
  categoryId: string;
}
