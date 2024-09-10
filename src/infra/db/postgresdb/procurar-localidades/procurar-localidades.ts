import { PrismaClient } from "@prisma/client";

import { ProcurarLocalidadeIdent } from "../../../../data/usecase/procurar-funcionario/procurar-localidades";
import { prisma } from "../../../database/Prisma";

export class LocalidadePostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findMany(input?: { not?: { groupId?: number } }) {
    return await this.prisma.localidade.findMany({
      orderBy: { codigo: "asc" },
    });
  }
}
