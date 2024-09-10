import { PrismaClient } from "@prisma/client";

import { prisma, prismaPromise } from "../../../database/Prisma";

export class CriarAgrupamentoLocalidadePostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findFisrtLocalidade(input: { codigo: string }) {
    return await this.prisma.localidade.findFirst({
      where: {
        codigo: input.codigo,
      },
    });
  }

  public async createAgrupamentoLocalidade(input: { codigos: string[] }) {
    return await this.prisma.grupo_localidade.create({
      data: {
        localidades: { connect: input.codigos.map((codigo) => ({ codigo })) },
      },
    });
  }
}
