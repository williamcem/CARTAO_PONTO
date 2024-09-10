import { PrismaClient } from "@prisma/client";

import { prisma, prismaPromise } from "../../../database/Prisma";

export class ConsultarAgrupamentoLocalidadePostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findMany() {
    return await this.prisma.grupo_localidade.findFirst({
      include: {
        localidades: true,
      },
    });
  }
}
