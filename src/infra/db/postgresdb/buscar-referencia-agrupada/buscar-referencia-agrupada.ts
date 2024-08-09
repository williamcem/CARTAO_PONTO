import { PrismaClient } from "@prisma/client";

import { prisma } from "../../../database/Prisma";

export class BuscarReferenciaAgrupadaPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findManyReferenciaAgrupada(input: { dataInicial: Date }) {
    const result = await this.prisma.cartao.groupBy({
      by: "referencia",
      where: { referencia: { gte: input.dataInicial } },
      orderBy: { referencia: "desc" },
    });

    return result;
  }

  public async findFisrtParametros() {
    const result = await this.prisma.parametros.findFirst({
      select: { qtdeDiasAnteriorCartao: true },
    });

    return result;
  }
}
