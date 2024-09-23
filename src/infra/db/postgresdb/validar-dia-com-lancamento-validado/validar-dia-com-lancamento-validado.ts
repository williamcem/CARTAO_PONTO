import { PrismaClient } from "@prisma/client";

import { prisma, prismaPromise } from "../../../database/Prisma";

export class ValidarDiaComLancamentoValidadoPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findManyDia(input: { take: number; skip: number }) {
    const result = await this.prisma.cartao_dia.findMany({
      where: {
        validadoPeloOperador: false,
      },
      select: {
        id: true,
        cartao_dia_lancamentos: {
          select: {
            validadoPeloOperador: true,
          },
        },
        eventos: {
          select: {
            tipoId: true,
          },
          where: {
            tipoId: 2,
          },
        },
      },
      take: input.take,
      skip: input.skip,
    });

    return result;
  }

  public async update(input: { id: number; validadoPeloOperador: boolean }) {
    const result = await this.prisma.cartao_dia.update({
      where: {
        id: input.id,
      },
      data: {
        validadoPeloOperador: input.validadoPeloOperador,
      },
    });

    return result;
  }
}
