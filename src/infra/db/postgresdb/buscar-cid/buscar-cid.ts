import { PrismaClient } from "@prisma/client";

import { prisma, prismaPromise } from "../../../database/Prisma";

export class BuscarCidPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findMany(input: { codigo: string }) {
    return await this.prisma.cid.findMany({
      where: {
        codigo: { contains: `%${input.codigo}%` },
      },
      select: {
        codigo: true,
        descricao: true,
      },
      orderBy: {
        codigo: "asc",
      },
    });
  }
}
