import { PrismaClient } from "@prisma/client";

import { prisma, prismaPromise } from "../../../database/Prisma";

export class ExcluirAgrupamentoLocalidadePostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findFisrt(input: { id: number }) {
    return await this.prisma.grupo_localidade.findFirst({
      where: {
        id: input.id,
      },
    });
  }

  public async delete(input: { id: number }) {
    return await this.prisma.grupo_localidade.delete({
      where: {
        id: input.id,
      },
    });
  }
}
