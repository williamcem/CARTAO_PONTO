import { PrismaClient } from "@prisma/client";

import { ListarLacamentos } from "../../../../data/usecase/add-listar-status-lancamento/add-listar-status";
import { prisma } from "../../../database/Prisma";

export class ListarLancamentoRepsository implements ListarLacamentos {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async list(): Promise<{ nome: string }[]> {
    return await this.prisma.cartao_dia_lancamento_status.findMany();
  }
}
