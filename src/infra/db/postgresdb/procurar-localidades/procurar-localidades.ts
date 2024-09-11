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
      include: { grupoLocalidade: { select: { nome: true } } },
    });
  }

  public async findFisrt(input?: { codigo: string }) {
    return await this.prisma.localidade.findFirst({
      where: { codigo: input?.codigo },
      select: { grupoLocalidadeId: true },
    });
  }
}
