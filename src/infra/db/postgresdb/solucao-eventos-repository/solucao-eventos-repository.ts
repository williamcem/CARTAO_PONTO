import { PrismaClient } from "@prisma/client";

import { AdicionarSolucao } from "../../../../data/usecase/add-solucao-eventos/add-solucao-eventos";
import { prisma } from "../../../database/Prisma";

export class SolucaoEventoRepository implements AdicionarSolucao {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async add(input: { id: number; tipoId: number }): Promise<boolean> {
    const { id, tipoId } = input;

    const eventoOriginal = await this.prisma.eventos.findUnique({
      where: { id: id },
    });

    if (!eventoOriginal) {
      throw new Error("Evento original não encontrado");
    }

    let minutos;
    if (tipoId === 3) {
      minutos = 0;
    } else if (tipoId === 5 || tipoId === 6) {
      minutos = Math.abs(eventoOriginal.minutos);
    } else {
      minutos = eventoOriginal.minutos;
    }

    // Atualizar o evento original para definir tratado como true
    await this.prisma.eventos.update({
      where: { id: id },
      data: { tratado: true },
    });

    const novoEvento = await this.prisma.eventos.create({
      data: {
        cartaoDiaId: eventoOriginal.cartaoDiaId,
        hora: eventoOriginal.hora,
        tipoId: tipoId,
        funcionarioId: eventoOriginal.funcionarioId,
        minutos: minutos,
        tratado: true, // Define tratado como true no novo evento
      },
    });

    return !!novoEvento;
  }
}
