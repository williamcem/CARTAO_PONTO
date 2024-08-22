import { PrismaClient } from "@prisma/client";

import { prisma } from "../../../database/Prisma";

export class OcorrenciaGeralPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findOcorrencia(localidade: string) {
    const funcionarios = await this.prisma.funcionario.findMany({
      where: {
        localidadeId: localidade,
        cartao: {
          some: {
            cartao_dia: {
              some: {
                eventos: {
                  some: { tratado: false, cartao_dia: { cartao_dia_lancamentos: { some: { validadoPeloOperador: true } } } },
                },
              },
            },
          },
        },
      },
      include: {
        cartao: {
          include: {
            cartao_dia: {
              include: {
                eventos: {
                  where: { tratado: false },
                },
                cartao_dia_lancamentos: true,
              },
              orderBy: { id: "asc" },
            },
          },
          orderBy: { id: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });

    return funcionarios;
  }
}
