import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CategoryService } from '../category/category.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpentDto } from './dto/create-spent.dto';
import { UpdateSpentDto } from './dto/update-spent.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class SpentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoryService: CategoryService,
  ) {}

  private readonly logger = new Logger(SpentService.name);

  async create(createSpentDto: CreateSpentDto, userId: string) {
    await this.categoryService.categoryNotExistsById(createSpentDto.categoryId, userId);

    this.logger.log('Buscando saldo da categoria');
    const categoryBalance = await this.categoryService.findBalance(
      createSpentDto.categoryId,
      userId,
    );

    if (Number(categoryBalance?.balance) < Number(createSpentDto.value)) {
      this.logger.error('Saldo insuficiente');
      throw new BadRequestException('Saldo insuficiente');
    }

    const newBalance = Number(categoryBalance?.balance) - Number(createSpentDto.value);
    await this.categoryService.updateCategoryBalance(
      createSpentDto.categoryId,
      newBalance,
      userId,
    );

    try {
      this.logger.log('Criando gasto');
      return this.prisma.spent.create({
        data: { ...createSpentDto, userId },
      });
    } catch (error) {
      this.logger.error('Erro ao criar gasto', error);
      throw new InternalServerErrorException('Erro ao criar gasto', error);
    }
  }

  async findAll(paginationDto: PaginationDto, userId: string) {
    try {
      let page = Number(paginationDto.page) || 1;
      const pageSize = Number(paginationDto.pageSize) || 5;

      if (page < 0) {
        page = 1;
      }

      const skip = (page - 1) * pageSize;
      const take = pageSize;

      const spents = await this.listAllSpents(skip, take, userId);

      const totalSpents = await this.totalSpentsCount(userId);
      const totalPages = Math.ceil(totalSpents / pageSize);

      const data = {
        spents,
        totalSpents,
        totalPages,
        pageSize: pageSize,
        page: page,
      };

      this.logger.log('Buscando todos os gastos com paginação do usuário '+userId);
      return data;
    } catch (error) {
      this.logger.error('Erro ao buscar um gasto', error);
      throw new InternalServerErrorException('Erro ao buscar um gasto');
    }
  }

  async findOne(id: string, userId: string) {
    await this.spentNotFound(id, userId);
    this.logger.log(`Buscando gasto com id ${id}`);
    return this.prisma.spent.findUnique({ where: { id } });
  }

  async update(id: string, updateSpentDto: UpdateSpentDto, userId: string) {
    await this.spentNotFound(id, userId);
    await this.categoryService.categoryNotExistsById(updateSpentDto.categoryId, userId);
    try {
      this.logger.log(`Atualizando gasto com id ${id}`);
      return this.prisma.spent.update({ where: { id }, data: updateSpentDto });
    } catch (error) {
      this.logger.error(`Erro ao atualizando gasto com id ${id}`, error);
      throw new InternalServerErrorException(`Erro ao atualizando gasto com id ${id}`, error);
    }
  }

  async remove(id: string, userId: string) {
    await this.spentNotFound(id, userId);
    return this.prisma.spent.delete({ where: { id } });
  }

  async listAllSpents(skip: number, take: number, userId: string) {
    const spents = await this.prisma.spent.findMany({
      where: { userId },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
      select: {
        id: true,
        value: true,
        description: true,
        createdAt: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      skip: skip,
      take: take,
    });

    this.logger.log('Buscando todos os gastos com paginação');
    return spents;
  }

  async totalSpentsCount(userId: string) {
    return await this.prisma.spent.count({ where: { userId } });
  }

  async spentNotFound(id: string, userId: string) {
    const spent = await this.prisma.spent.findFirst({
      where: { id, userId },
    });
    if (!spent) {
      this.logger.error(`Gasto com id ${id} não encontrado`);
      throw new NotFoundException(`Gasto com id ${id} não encontrado`);
    }
    return spent;
  }
}
