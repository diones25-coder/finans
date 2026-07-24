import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ConstructionService } from './construction.service';
import { CreateConstructionDto } from './dto/create-construction.dto';
import { UpdateConstructionDto } from './dto/update-construction.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from './dto/pagination.dto';
import { SanitizePipe } from '../pipes/sanitize.pipe';

@ApiTags('construction')
@ApiBearerAuth()
@Controller('construction')
export class ConstructionController {
  constructor(private readonly constructionService: ConstructionService) {}

  @Post()
  @UsePipes(new SanitizePipe())
  @ApiOperation({
    summary: 'Criação de um gasto',
    description: 'Endpoint responsável pela criação de um gasto',
  })
  @ApiResponse({
    status: 201,
    description: 'Gasto criado com sucesso',
    example: {
      id: '695b956e-4fa4-434b-84c7-a6ea5a04bff0',
      name: 'Cimento',
      quantity: 2,
      unitaryValue: '39.50',
      amount: '79',
      createdAt: '2025-05-06T00:55:55.813Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação do body',
    example: {
      message: [
        'Nome deve ter no mínimo 5 caracteres',
        'Nome deve ser uma string',
        'A quantidade deve ser maior que zero',
        'A quantidade deve ser um número válido',
        'O valor unitário deve ser maior que zero',
        'O valor unitário deve ser um número válido',
      ],
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  create(@Body() createConstructionDto: CreateConstructionDto) {
    return this.constructionService.create(createConstructionDto);
  }

  @Get('all')
  @UsePipes(new SanitizePipe())
  @ApiOperation({
    summary: 'Listando todos os gastos',
    description:
      'Endpoint responsável por listar todos os gastos com paginação',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos os gasto retornado com sucesso',
    example: {
      spents: [
        {
          id: '21835ae7-0782-4d55-86ab-fea90e63a0d1',
          name: 'Tinta',
          quantity: 2,
          unitaryValue: '39.5',
          amount: '79',
          createdAt: '2025-05-06T01:05:23.791Z',
        },
        {
          id: 'f38b12a6-021a-4725-a0ed-0c7f1cf2cef9',
          name: 'Tinta',
          quantity: 2,
          unitaryValue: '39.5',
          amount: '79',
          createdAt: '2025-05-06T01:03:36.337Z',
        },
        {
          id: '66eff139-7828-45a5-a21a-0f65c1349e4d',
          name: 'Tinta',
          quantity: 2,
          unitaryValue: '39.5',
          amount: '79',
          createdAt: '2025-05-06T00:55:55.813Z',
        },
        {
          id: '12433e9e-6655-408f-ab7b-6d85d97e3e7f',
          name: 'Tinta',
          quantity: 2,
          unitaryValue: '100',
          amount: '200',
          createdAt: '2025-05-06T00:55:45.540Z',
        },
        {
          id: '695b956e-4fa4-434b-84c7-a6ea5a04bff0',
          name: 'Tinta',
          quantity: 1,
          unitaryValue: '100',
          amount: '100',
          createdAt: '2025-05-06T00:52:09.729Z',
        },
      ],
      totalSpents: 49,
      totalPages: 10,
      pageSize: 5,
      page: 4,
    },
  })
  findAll(@Query() pagination: PaginationDto) {
    return this.constructionService.findAll(pagination);
  }

  @ApiOperation({
    summary: 'Listando valor total de gastos',
    description: 'Endpoint responsável por listar o total de gastos',
  })
  @ApiResponse({
    status: 200,
    description: 'Listando o valor total com sucesso',
    example: {
      totalValue: 8289.5,
    },
  })
  @Get('amount')
  findAmount() {
    return this.constructionService.getAmount();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Listando um gasto',
    description: 'Endpoint responsável por listar um gasto',
  })
  @ApiResponse({
    status: 200,
    description: 'Gasto retornado com sucesso',
    example: {
      id: 'a7156466-3c97-426b-8c8c-dee1acb2d003',
      name: 'Tinta',
      quantity: 2,
      unitaryValue: '50',
      amount: '100',
      createdAt: '2025-05-05T14:41:00.623Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Id não encontrado',
    example: {
      message:
        'Gasto com id a7156466-3c97-426b-8c8c-dee1acb2d0032 não encontrado',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  findOne(@Param('id') id: string) {
    return this.constructionService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new SanitizePipe())
  @ApiOperation({
    summary: 'Edição de um gasto',
    description: 'Endpoint responsável por editar um gasto',
  })
  @ApiResponse({
    status: 200,
    description: 'Gasto editado com sucesso',
    example: {
      id: '2668602a-579e-4d1e-ac7e-60b2f9215a36',
      name: 'Tinta de parede',
      quantity: 10,
      unitaryValue: '150.45',
      amount: '1504.5',
      createdAt: '2025-05-06T01:05:28.512Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Id não encontrado',
    example: {
      message:
        'Gasto com id 2668602a-579e-4d1e-ac7e-60b2f9215a36 não encontrado',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateConstructionDto: UpdateConstructionDto,
  ) {
    return this.constructionService.update(id, updateConstructionDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remoção de um gasto',
    description: 'Endpoint responsável por deletar um gasto',
  })
  @ApiResponse({
    status: 200,
    description: 'Gasto deletado com sucesso',
    example: {
      id: '13d7d323-ff00-4b9b-addc-51063f59f432',
      name: 'Tinta',
      quantity: 2,
      unitaryValue: '39.5',
      amount: '79',
      createdAt: '2025-05-06T01:05:25.642Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Id não encontrado',
    example: {
      message:
        'Gasto com id 13d7d323-ff00-4b9b-addc-51063f59f432 não encontrado',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  remove(@Param('id') id: string) {
    return this.constructionService.remove(id);
  }
}
