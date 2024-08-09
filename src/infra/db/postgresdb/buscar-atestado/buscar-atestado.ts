import { PrismaClient } from "@prisma/client";

import { prisma } from "../../../database/Prisma";

export class BuscarAtestadoPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findMany(input: {
    pagina?: number;
    quantidade?: number;
    statusId?: number;
    not?: { statusId?: number };
    orderBy?: { id?: "asc" | "desc" };
  }) {
    const result = await this.prisma.atestado_funcionario.findMany({
      take: input.quantidade,
      skip: input.pagina,
      where: { statusId: { equals: input.statusId, not: input.not?.statusId } },
      orderBy: input.orderBy,
      include: {
        atestado_abonos: { include: { cartao_dia: { select: { data: true } } } },
        tipo_acompanhante: true,
        tipo_ocupacao: true,
        tipo_certidao_obito: true,
        entradas_saidas_atestado: true,
        tipo_comprovante_ausencia: true,
        tipo_status: true,
        tipos_documentos: true,
        tipo_eventos: true,
      },
    });

    return result;
  }
}
