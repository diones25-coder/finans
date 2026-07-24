import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConstructionDto } from './dto/create-construction.dto';
import { UpdateConstructionDto } from './dto/update-construction.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class ConstructionService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly logger = new Logger(ConstructionService.name);

  async create(createConstructionDto: CreateConstructionDto) {
    try {
      const amount =
        Number(createConstructionDto.quantity) *
        Number(createConstructionDto.unitaryValue);
      this.logger.log('Criando gasto');
      return this.prisma.construction.create({
        data: {
          name: createConstructionDto.name,
          quantity: createConstructionDto.quantity,
          unitaryValue: createConstructionDto.unitaryValue,
          amount,
        },
      });
    } catch (error) {
      this.logger.error('Erro ao criar gasto', error);
      throw new InternalServerErrorException('Erro ao criar gasto', error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      let page = Number(paginationDto.page) || 1;
      const pageSize = Number(paginationDto.pageSize) || 5;

      if (page < 0) {
        page = 1;
      }

      const skip = (page - 1) * pageSize;
      const take = pageSize;

      const spents = await this.listAllConstruction(skip, take);

      const totalSpents = await this.totalConstructionsCount();
      const totalPages = Math.ceil(totalSpents / pageSize);

      const data = {
        spents,
        totalSpents,
        totalPages,
        pageSize: pageSize,
        page: page,
      };

      this.logger.log('Buscando todos os gastos com paginação');
      return data;
    } catch (error) {
      this.logger.error('Erro ao buscar um gasto', error);
      throw new InternalServerErrorException('Erro ao buscar um gasto');
    }
  }

  async findOne(id: string) {
    await this.constructionNotFound(id);
    this.logger.log(`Buscando gasto com id ${id}`);
    return this.prisma.construction.findUnique({ where: { id } });
  }

  async update(id: string, updateConstructionDto: UpdateConstructionDto) {
    await this.constructionNotFound(id);
    await this.validateQuantityAndUnitaryValue(
      Number(updateConstructionDto.quantity),
      Number(updateConstructionDto.unitaryValue),
    );

    const newAmount =
      Number(updateConstructionDto.quantity) *
      Number(updateConstructionDto.unitaryValue);

    try {
      this.logger.log(`Atualizando gasto com id ${id}`);
      return this.prisma.construction.update({
        where: {
          id,
        },
        data: {
          name: updateConstructionDto.name,
          quantity: updateConstructionDto.quantity,
          unitaryValue: updateConstructionDto.unitaryValue,
          amount: newAmount,
        },
      });
    } catch (error) {
      this.logger.error(`Erro ao atualizando gasto com id ${id}`, error);
      throw new InternalServerErrorException(
        `Erro ao atualizando gasto com id ${id}`,
        error,
      );
    }
  }

  async remove(id: string) {
    await this.constructionNotFound(id);
    this.logger.log(`Removendo gasto com id ${id}`);
    return this.prisma.construction.delete({ where: { id } });
  }

  async getAmount() {
    try {
      const constructions = await this.constructionAmount();

      const nums = constructions.map((item) => {
        return item.amount;
      });

      const amount = nums.reduce(
        (acumulator, element) => Number(acumulator) + Number(element),
        0,
      );

      return {
        totalValue: amount,
      };
    } catch (error) {
      this.logger.error(`Erro ao retornar o total de gastos`, error);
      throw new InternalServerErrorException(
        `Erro ao retornar o total de gastos`,
        error,
      );
    }
  }

  async listAllConstruction(skip: number, take: number) {
    const constructions = await this.prisma.construction.findMany({
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
      skip: skip,
      take: take,
    });

    return constructions;
  }

  async totalConstructionsCount() {
    return await this.prisma.construction.count();
  }

  async constructionNotFound(id: string) {
    const construction = await this.prisma.construction.findUnique({
      where: { id },
    });
    if (!construction) {
      this.logger.error(`Gasto com id ${id} não encontrado`);
      throw new BadRequestException(`Gasto com id ${id} não encontrado`);
    }
    return construction;
  }

  async constructionAmount() {
    return this.prisma.construction.findMany({
      select: {
        amount: true,
      },
    });
  }

  async validateQuantityAndUnitaryValue(
    quantity: number,
    unitaryValue: number,
  ) {
    if (!quantity || !unitaryValue) {
      this.logger.error('Quantidade ou valor unitário inválidos');
      throw new BadRequestException('Quantidade ou valor unitário inválidos');
    }
  }
}
