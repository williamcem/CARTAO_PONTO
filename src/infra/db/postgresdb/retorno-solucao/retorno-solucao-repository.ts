import { PrismaClient } from "@prisma/client";

import { RetornarSolucao } from "../../../../data/usecase/add-solucao-eventos/retorno-solucao";
import { prisma } from "../../../database/Prisma";

export class RetornoSolucaoRepository implements RetornarSolucao {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async resetTratado(input: { cartaoDiaId: number }): Promise<boolean> {
    const { cartaoDiaId } = input;

    const eventosAtualizados = await this.prisma.eventos.updateMany({
      where: { cartaoDiaId: cartaoDiaId },
      data: { tratado: false },
    });

    return eventosAtualizados.count > 0;
  }
}
