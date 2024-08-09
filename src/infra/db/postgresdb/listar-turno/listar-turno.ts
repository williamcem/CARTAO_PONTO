import { PrismaClient } from "@prisma/client";

import { prisma } from "../../../database/Prisma";

export class ListarTurnoPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findMany() {
    const result = await this.prisma.turno.findMany({});

    return result;
  }
}
