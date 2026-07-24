import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateBalanceCategoryDto {
  @ApiProperty({
    example: 100,
    description: 'Saldo da categoria',
    minLength: 1,
  })
  @IsNumber({}, { message: 'O Saldo deve ser um número válido' })
  @Min(1, { message: 'Saldo deve ser maior que zero' })
  balance: number;
}
