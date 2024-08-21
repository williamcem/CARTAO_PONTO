import { PrismaClient } from "@prisma/client";

import { prisma, prismaPromise } from "../../../database/Prisma";

export class BuscarAlteracaoTurnoPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findMany(input: { cartaoId: number }) {
    return await this.prisma.funcionario_alteracao_turno.findMany({
      where: {
        dias: {
          some: { cartao: { id: input.cartaoId } },
        },
      },
      select: {
        id: true,
        inicio: true,
        fim: true,
        turno: {
          select: {
            nome: true,
          },
        },
      },
    });
  }
}
