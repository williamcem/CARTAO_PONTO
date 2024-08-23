import { PrismaClient } from "@prisma/client";

import { prisma, prismaPromise } from "../../../database/Prisma";

export class FinalizarCartaoPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findFisrt(input: { id: number }) {
    return await this.prisma.cartao.findFirst({
      where: {
        id: input.id,
      },
      include: {
        cartao_dia: {
          include: {
            eventos: true,
            cartao_dia_lancamentos: true,
          },
        },
      },
    });
  }

  public async update(input: { id: number; userName: string; updateAt: Date; statusId: number }) {
    return await this.prisma.cartao.update({
      where: {
        id: input.id,
      },
      data: {
        statusId: input.statusId,
        userName: input.userName,
        updateAt: input.updateAt,
      },
    });
  }

  public async findManyAtestado(input: { funcionarioId: number; statusId: number }) {
    return await this.prisma.atestado_funcionario.findMany({
      where: {
        funcionarioId: input.funcionarioId,
        statusId: input.statusId,
      },
      select: { id: true, tipos_documentos: true, data: true },
    });
  }
}
