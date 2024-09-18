import { PrismaClient } from "@prisma/client";

import { prisma, prismaPromise } from "../../../database/Prisma";

export class GerarArquivoFechamentoCartaoPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findManyCartao(input: { referencia: Date }) {
    return await this.prisma.cartao.findMany({
      where: {
        referencia: input.referencia,
      },
      select: {
        id: true,
        cartao_horario_compensado: {
          select: {
            periodo: { select: { nome: true } },
            ext1: true,
            ext2: true,
            ext3: true,
            periodoId: true,
          },
        },
        cartao_horario_pago: {
          select: {
            periodo: { select: { nome: true } },
            ext1: true,
            ext2: true,
            ext3: true,
            periodoId: true,
          },
        },
        funcionario: {
          select: {
            identificacao: true,
            nome: true,
          },
        },
      },
    });
  }
}
