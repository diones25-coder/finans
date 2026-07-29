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
import { SpentService } from './spent.service';
import { CreateSpentDto } from './dto/create-spent.dto';
import { UpdateSpentDto } from './dto/update-spent.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from './dto/pagination.dto';
import { SanitizePipe } from '../pipes/sanitize.pipe';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('spent')
@ApiBearerAuth()
@Controller('spent')
export class SpentController {
  constructor(private readonly spentService: SpentService) {}

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
      id: 'd7ddc2ea-da9d-4245-8df5-88558555aa61',
      value: '4.5',
      description: 'Sorvete',
      categoryId: '92385fb0-2ed3-4e13-8605-11fd0b4a201f',
      createdAt: '2025-05-06T12:40:46.103Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação do body',
    example: {
      message: [
        'O gasto deve ser maior que zero',
        'O gasto deve ser um número válido',
        'Nome deve ter no mínimo 4 caracteres',
        'Nome deve ser uma string',
        'Id da categoria deve ser uma string',
      ],
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Categoria não encontrada',
    example: {
      message:
        'Categoria com id 92385fb0-2ed3-4e13-8605-11fd0b4a201fw não existe',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    example: {
      message: 'Erro ao criar gasto',
      error: 'Internal Server Error',
      statusCode: 500,
    },
  })
  create(@Body() createSpentDto: CreateSpentDto, @CurrentUser('id') userId: string) {
    return this.spentService.create(createSpentDto, userId);
  }

  @Get('all')
  @UsePipes(new SanitizePipe())
  @ApiOperation({
    summary: 'Listando todos os gastos',
    description:
      'Endpoint responsavel por listar todos os gastos com paginacao, busca por nome e filtro por data',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos os gasto retornado com sucesso',
    example: {
      spents: [
        {
          id: '5f17683d-24bc-46a4-919e-5cb8aba369ce',
          value: '4',
          description: 'Sorvete',
          createdAt: '2025-05-03T05:52:27.817Z',
          category: {
            name: 'categoria de teste',
          },
        },
        {
          id: 'd5a7edfd-c53b-40b8-8425-1c95d74af5c2',
          value: '4',
          description: 'Sorvete',
          createdAt: '2025-05-03T05:45:12.537Z',
          category: {
            name: 'Alimentação',
          },
        },
        {
          id: '468dfb9d-a9b8-4801-833a-f669ddc942f6',
          value: '10',
          description: 'Batata doce',
          createdAt: '2025-05-03T05:44:25.518Z',
          category: {
            name: 'Alimentação',
          },
        },
        {
          id: '7c508ced-7c47-4dac-bd7a-305a2aec2bd5',
          value: '10',
          description: 'Batata doce',
          createdAt: '2025-05-03T05:18:26.638Z',
          category: {
            name: 'Alimentação',
          },
        },
        {
          id: 'a906a4f3-63a5-40bc-8437-305692e9dbc8',
          value: '20',
          description: 'Carne moída',
          createdAt: '2025-05-03T05:17:36.804Z',
          category: {
            name: 'Alimentação',
          },
        },
      ],
      totalSpents: 35,
      totalPages: 7,
      pageSize: 5,
      page: 7,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    example: {
      message: 'Erro ao buscar um gasto',
      error: 'Internal Server Error',
      statusCode: 500,
    },
  })
  findAll(@Query() pagination: PaginationDto, @CurrentUser('id') userId: string) {
    return this.spentService.findAll(pagination, userId);
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
      id: '6e7a7348-27e6-4071-90b7-579ccd2a15cc',
      value: '4.5',
      description: 'Sorvete de chocolate',
      categoryId: '92385fb0-2ed3-4e13-8605-11fd0b4a201f',
      createdAt: '2025-05-04T19:09:14.372Z',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Id não encontrado',
    example: {
      message:
        'Gasto com id a7156466-3c97-426b-8c8c-dee1acb2d0032 não encontrado',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.spentService.findOne(id, userId);
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
      id: '6e7a7348-27e6-4071-90b7-579ccd2a15cc',
      value: '4.5',
      description: 'Sorvete de chocolate',
      categoryId: '92385fb0-2ed3-4e13-8605-11fd0b4a201f',
      createdAt: '2025-05-04T19:09:14.372Z',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Id não encontrado',
    example: {
      message:
        'Gasto com id 6e7a7348-27e6-4071-90b7-579ccd2a15cc1 não encontrado',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    example: {
      message:
        'Erro ao atualizando gasto com id 6e7a7348-27e6-4071-90b7-579ccd2a15cc1',
      error: 'Internal Server Error',
      statusCode: 500,
    },
  })
  update(@Param('id') id: string, @Body() updateSpentDto: UpdateSpentDto, @CurrentUser('id') userId: string) {
    return this.spentService.update(id, updateSpentDto, userId);
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
    status: 404,
    description: 'Id não encontrado',
    example: {
      message:
        'Gasto com id 13d7d323-ff00-4b9b-addc-51063f59f432 não encontrado',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.spentService.remove(id, userId);
  }
}
