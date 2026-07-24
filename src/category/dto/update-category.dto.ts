import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Matches, Min, MinLength } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    example: 'Alimentação',
    description: 'Nome da categoria',
    minLength: 4,
  })
  @IsString({ message: 'Nome deve ser uma string' })
  @MinLength(4, { message: 'Nome deve ter no mínimo 4 caracteres' })
  @Matches(/^[A-Za-zÀ-ÿ0-9\s]+$/, {
    message: 'Nome deve conter apenas letras, números e espaços',
  })
  name: string;

  @ApiProperty({
    example: 100,
    description: 'Saldo da categoria',
    minLength: 1,
  })
  @IsNumber({}, { message: 'O Saldo deve ser um número válido' })
  @Min(1, { message: 'Saldo deve ser maior que zero' })
  balance: number;
}
