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
    if (tipoId === 3 || tipoId === 7) {
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

    // Cria o novo evento com os valores apropriados
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

    // Verifica se é necessário criar eventos adicionais para tipoId 3 ou 6
    if (tipoId === 3 || tipoId === 6) {
      // Verificar e criar eventos para minutos entre -1 e -5
      const eventosEntreMenos1EMenos5 = await this.prisma.eventos.findMany({
        where: {
          cartaoDiaId: eventoOriginal.cartaoDiaId,
          minutos: { gte: -5, lte: -1 },
          tratado: false,
        },
      });

      for (const evento of eventosEntreMenos1EMenos5) {
        await this.prisma.eventos.update({
          where: { id: evento.id },
          data: { tratado: true },
        });

        console.log(`Hora do evento com minutos entre -1 e -5: ${evento.hora}`);

        await this.prisma.eventos.create({
          data: {
            cartaoDiaId: evento.cartaoDiaId,
            hora: evento.hora,
            tipoId: tipoId,
            funcionarioId: evento.funcionarioId,
            minutos: tipoId === 3 ? 0 : Math.abs(evento.minutos), // Define minutos como 0 para tipoId 3 e positivo para tipoId 6
            tratado: true,
          },
        });
      }
    }

    return !!novoEvento;
  }
}
