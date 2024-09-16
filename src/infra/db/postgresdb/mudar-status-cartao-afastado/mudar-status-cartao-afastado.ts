import { PrismaClient } from "@prisma/client";

import { prisma, prismaPromise } from "../../../database/Prisma";

export class MudarStatusCartaoAfastadoPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findManyFuncionariosAfastado() {
    const result = await this.prisma.funcionarios_afastados.findMany({
      where: {
        funcionario: {
          cartao: {
            some: {
              statusId: 1, //Importado
            },
          },
        },
        statusId: {
          not: 1, //Férias
        },
      },
      select: {
        inicio: true,
        fim: true,
        funcionario: {
          select: {
            cartao: {
              select: {
                id: true,
                statusId: true,
                cartao_dia: true,
              },
            },
          },
        },
      },
    });

    return result;
  }

  public async updateManyCartao(input: { id: number; statusId: number }[]) {
    const queries: prismaPromise[] = [];
    input.map((cartao) => {
      queries.push(this.prisma.cartao.update({ where: { id: cartao.id }, data: { statusId: cartao.statusId } }));
    });

    return await this.prisma.$transaction(queries);
  }
}
