import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(CategoryService.name);

  async create(createCategoryDto: CreateCategoryDto, userId: string) {
    await this.categoryExistsByName(createCategoryDto.name, userId);

    try {
      return this.prisma.category.create({
        data: { ...createCategoryDto, userId },
      });
    } catch (error) {
      this.logger.error('Erro ao criar categoria', error);
      throw new InternalServerErrorException('Erro ao criar categoria');
    }
  }

  async findAll(userId: string) {
    this.logger.log('Buscando todas as categorias');
    const categories = await this.prisma.category.findMany({
      where: { userId },
    });
    if (!categories || categories.length === 0) {
      this.logger.error('Nenhuma categoria encontrada');
      throw new NotFoundException('Nenhuma categoria encontrada');
    }

    return categories;
  }

  async findOne(id: string, userId: string) {
    await this.categoryNotExistsById(id, userId);
    this.logger.log(`Buscando categoria com id ${id}`);
    return this.prisma.category.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, userId: string) {
    await this.categoryNotExistsById(id, userId);
    try {
      return this.prisma.category.update({
        where: {
          id,
        },
        data: updateCategoryDto,
      });
    } catch (error) {
      this.logger.error('Erro ao atualizar uma categoria', error);
      throw new InternalServerErrorException('Erro ao atualizar uma categoria');
    }
  }

  async remove(id: string, userId: string) {
    await this.categoryNotExistsById(id, userId);
    const hasSpents = await this.hasLinkedSpents(id);
    if (hasSpents) {
      throw new BadRequestException(
        'Não é possível remover esta categoria pois existem gastos vinculados a ela',
      );
    }
    try {
      return this.prisma.category.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      this.logger.error('Erro ao remover uma categoria', error);
      throw new InternalServerErrorException('Erro ao remover uma categoria');
    }
  }

  async hasLinkedSpents(categoryId: string): Promise<boolean> {
    const spents = await this.prisma.spent.findFirst({
      where: {
        categoryId: categoryId,
      },
    });

    return !!spents;
  }

  async categoryNotExistsById(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        userId,
      },
    });
    if (!category) {
      this.logger.error(`Categoria com id ${id} não existe`);
      throw new NotFoundException(`Categoria com id ${id} não existe`);
    }
  }

  async categoryExistsByName(name: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      select: {
        name: true,
      },
      where: {
        name,
        userId,
      },
    });
    if (category) {
      this.logger.error(`Categoria com o nome ${name} já existe`);
      throw new NotFoundException(`Categoria com o nome ${name} já existe`);
    }
  }

  async findBalance(id: string, userId: string) {
    await this.categoryNotExistsById(id, userId);
    return await this.prisma.category.findUnique({
      where: {
        id,
      },
      select: {
        balance: true,
      },
    });
  }

  async addBalance(id: string, balance: number, userId: string) {
    try {
      const balanceBD = await this.findBalance(id, userId);
      const newBalance = Number(balanceBD?.balance) + Number(balance);

      this.logger.log(
        `Adicionando ${balance} ao saldo da categoria com id ${id}`,
      );
      return await this.prisma.category.update({
        where: {
          id,
        },
        data: {
          balance: newBalance,
        },
      });
    } catch (error) {
      this.logger.error('Erro ao adicionar saldo', error);
      throw new InternalServerErrorException('Erro ao adicionar saldo');
    }
  }

  async updateCategoryBalance(id: string, balance: number, userId: string) {
    return await this.prisma.category.update({
      where: {
        id,
      },
      data: {
        balance: balance,
      },
    });
  }
}
