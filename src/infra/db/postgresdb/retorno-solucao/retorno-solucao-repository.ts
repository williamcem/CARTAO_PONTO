import { PrismaClient } from "@prisma/client";

import { RetornarSolucao } from "../../../../data/usecase/add-solucao-eventos/retorno-solucao";
import { prisma } from "../../../database/Prisma";

export class RetornoSolucaoRepository implements RetornarSolucao {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async resetTratado(input: { eventoId: number; cartaoDiaId: number }): Promise<boolean> {
    const { eventoId, cartaoDiaId } = input;

    // Busca o evento específico pelo ID e cartaoDiaId
    const evento = await this.prisma.eventos.findUnique({
      where: { id: eventoId, cartaoDiaId: cartaoDiaId },
    });

    if (!evento) {
      return false;
    }

    // Busca e exclui qualquer evento com a mesma hora
    await this.prisma.eventos.deleteMany({
      where: { hora: evento.hora, id: { not: eventoId } },
    });

    // Atualiza o evento específico
    const eventoAtualizado = await this.prisma.eventos.update({
      where: { id: eventoId },
      data: { tratado: false },
    });

    return !!eventoAtualizado;
  }

  public async findFisrt(input: { id: number }) {
    return await this.prisma.eventos.findFirst({
      where: { id: input.id },
    });
  }

  public async delete(input: { id: number }) {
    return await this.prisma.eventos.delete({
      where: { id: input.id },
    });
  }
}
