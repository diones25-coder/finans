import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UsePipes,
} from '@nestjs/common';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UpdateBalanceCategoryDto } from './dto/update-balance-category.dto';
import { SanitizePipe } from '../pipes/sanitize.pipe';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('create')
  @UsePipes(new SanitizePipe())
  @ApiOperation({
    summary: 'Criação de uma categoria',
    description: 'Endpoint responsável pela criação de uma categoria',
  })
  @ApiResponse({
    status: 201,
    description: 'Gasto criado com sucesso',
    example: {
      id: '075cb850-9ebe-4e9b-8cc9-eb2112551669',
      name: 'Alimentação',
      balance: '200',
      createdAt: '2025-05-07T01:12:12.898Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Categoria inválida',
    example: {
      message: 'Categoria com o nome Alimentação já existe',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    example: {
      message: 'Erro ao criar categoria',
      error: 'Internal Server Error',
      statusCode: 500,
    },
  })
  create(@Body() createCategoryDto: CreateCategoryDto, @CurrentUser('id') userId: string) {
    return this.categoryService.create(createCategoryDto, userId);
  }

  @Get('all')
  @UsePipes(new SanitizePipe())
  @ApiOperation({
    summary: 'Buscando todas as categorias',
    description: 'Endpoint responsável por listar todas as categorias',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas as categorias retornado com sucesso',
    example: [
      {
        id: '783c9356-cf94-4303-9846-0b5e94c99867',
        name: 'Negócios',
        balance: '500',
        createdAt: '2025-05-02T23:41:55.560Z',
      },
      {
        id: '745168a0-35c4-406e-932b-02e2925feb90',
        name: 'Alimentação',
        balance: '756',
        createdAt: '2025-05-02T23:41:45.770Z',
      },
    ],
  })
  findAll(@CurrentUser('id') userId: string) {
    return this.categoryService.findAll(userId);
  }

  @Get('balance/:id')
  @ApiOperation({
    summary: 'Listando um saldo de uma categoria',
    description: 'Endpoint responsável por listar um saldo de uma categoria',
  })
  @ApiResponse({
    status: 200,
    description: 'Saldo retornado com sucesso',
    example: {
      balance: '756',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Id não encontrado',
    example: {
      message:
        'Categoria com id 745168a0-35c4-406e-932b-02e2925feb902 não existe',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  findBalance(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.categoryService.findBalance(id, userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Listando uma categoria',
    description: 'Endpoint responsável por listar uma categoria',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoria retornado com sucesso',
    example: {
      id: '745168a0-35c4-406e-932b-02e2925feb90',
      name: 'Alimentação',
      balance: '756',
      createdAt: '2025-05-02T23:41:45.770Z',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Id não encontrado',
    example: {
      message:
        'Categoria com id 745168a0-35c4-406e-932b-02e2925feb902 não existe',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.categoryService.findOne(id, userId);
  }

  @Patch(':id')
  @UsePipes(new SanitizePipe())
  @ApiOperation({
    summary: 'Edição de uma categoria',
    description: 'Endpoint responsável pela editar de uma categoria',
  })
  @ApiResponse({
    status: 200,
    description: 'Gasto editado com sucesso',
    example: {
      id: '783c9356-cf94-4303-9846-0b5e94c99867',
      name: 'Negócios',
      balance: '500',
      createdAt: '2025-05-02T23:41:55.560Z',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Categoria não encontrada',
    example: {
      message:
        'Categoria com id 783c9356-cf94-4303-9846-0b5e94c998671 não existe',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    example: {
      message: 'Erro ao atualizar uma categoria',
      error: 'Internal Server Error',
      statusCode: 500,
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.categoryService.update(id, updateCategoryDto, userId);
  }

  @Put('balance/add/:id')
  @ApiOperation({
    summary: 'Adição de saldo em uma categoria',
    description: 'Endpoint responsável por adicionar saldo em uma categoria',
  })
  @ApiResponse({
    status: 200,
    description: 'Saldo adicionado com sucesso',
    example: {
      id: '92385fb0-2ed3-4e13-8605-11fd0b4a201f',
      name: 'Alimentação',
      balance: '2471',
      createdAt: '2025-05-03T05:51:15.556Z',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Categoria não encontrada',
    example: {
      message:
        'Categoria com id 783c9356-cf94-4303-9846-0b5e94c998671 não existe',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    example: {
      message: 'Erro ao adicionar saldo',
      error: 'Internal Server Error',
      statusCode: 500,
    },
  })
  updateBalance(
    @Param('id') id: string,
    @Body() updateBalanceCategoryDto: UpdateBalanceCategoryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.categoryService.addBalance(
      id,
      updateBalanceCategoryDto.balance,
      userId,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remoção de uma categoria',
    description: 'Endpoint responsável por remover uma categoria',
  })
  @ApiResponse({
    status: 200,
    description: 'Categoria removida com sucesso',
    example: {
      id: '02c2fc5c-77aa-486d-ac06-edfcd0fe2b45',
      name: 'categoria de teste 2',
      balance: '34',
      createdAt: '2025-05-07T01:07:58.975Z',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Categoria não encontrada',
    example: {
      message:
        'Categoria com id 02c2fc5c-77aa-486d-ac06-edfcd0fe2b45 não existe',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro interno do servidor',
    example: {
      message: 'Erro ao remover uma categoria',
      error: 'Internal Server Error',
      statusCode: 500,
    },
  })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.categoryService.remove(id, userId);
  }
}
