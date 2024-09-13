import { PrismaClient } from "@prisma/client";

import { prisma } from "../../../database/Prisma";

export class BuscarFuncionarioReferenciaLocalidadePostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findManyFuncionarios(input: { data: Date; localidadeId: string; statusIds?: number[] }) {
    const result = await this.prisma.funcionario.findMany({
      where: {
        cartao: { some: { referencia: input.data, statusId: { in: input.statusIds } } },
        localidadeId: input.localidadeId,
      },
      select: {
        id: true,
        nome: true,
        filial: true,
        identificacao: true,
        cartao: {
          include: {
            cartao_dia: {
              select: {
                id: true,
                data: true,
                cargaHor: true,
                cartao_dia_lancamentos: { select: { id: true, validadoPeloOperador: true } },
                statusId: true,
                eventos: {
                  select: {
                    tipoId: true,
                    tratado: true,
                  },
                },
              },
            },
          },
          where: {
            referencia: input.data,
          },
        },
        turno: { select: { id: true, nome: true } },
      },

      orderBy: { identificacao: "asc" },
    });

    return result;
  }

  public async findFisrtLocalidade(input: { localidadeId: string }) {
    const result = await this.prisma.localidade.findFirst({
      where: { codigo: input.localidadeId },
    });

    return result;
  }

  public async findFisrtReferencia(input: { referencia: Date }) {
    const result = await this.prisma.cartao.findFirst({
      where: { referencia: input.referencia },
    });

    return result;
  }
}
