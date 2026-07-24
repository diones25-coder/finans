import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min, MinLength } from 'class-validator';

export class CreateConstructionDto {
  @ApiProperty({
    example: 'Cimento',
    description: 'Nome do gasto',
    minLength: 5,
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(5, { message: 'Nome deve ter no mínimo 5 caracteres' })
  name: string;

  @ApiProperty({
    example: '2',
    description: 'Quantidade do gasto',
    minLength: 1,
  })
  @IsNumber({}, { message: 'A quantidade deve ser um número válido' })
  @Min(1, { message: 'A quantidade deve ser maior que zero' })
  quantity: number;

  @ApiProperty({
    example: 39.5,
    description: 'Valor unitário do gasto',
    minLength: 1,
  })
  @IsNumber({}, { message: 'O valor unitário deve ser um número válido' })
  @Min(1, { message: 'O valor unitário deve ser maior que zero' })
  unitaryValue: number;
}
