import { PrismaClient } from "@prisma/client";

import { ProcurarSolucoes } from "../../../../data/usecase/add-solucao-eventos/listar-tipo-solucao";
import { prisma } from "../../../database/Prisma";

export class SolucoesEventosPostgresRepository implements ProcurarSolucoes {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async list(): Promise<{ id: number; nome: string }[]> {
    return await this.prisma.tipo_eventos.findMany({
      where: {
        id: {
          in: [3, 5, 7],
        },
      },
    });
  }
}
