import { PrismaClient } from "@prisma/client";

import { prisma } from "../../../database/Prisma";

export class CompensacaoEventoRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async compensarEventos(cartaoDiaId: number): Promise<boolean> {
    const eventosTipo1 = await this.prisma.eventos.findMany({
      where: {
        cartaoDiaId,
        tipoId: 1,
        tratado: false,
      },
    });

    for (const eventoTipo1 of eventosTipo1) {
      const eventosTipo2 = await this.prisma.eventos.findMany({
        where: {
          cartaoDiaId,
          tipoId: 2,
          tratado: false,
          minutos: {
            gte: -eventoTipo1.minutos - 11, // Considera o intervalo de diferença de até 10 minutos para fazer compensação automática
            lte: -eventoTipo1.minutos + 11,
          },
        },
      });

      for (const eventoTipo2 of eventosTipo2) {
        // Marcar o evento tipoId 2 como tratado
        await this.prisma.eventos.update({
          where: { id: eventoTipo2.id },
          data: { tratado: true },
        });

        // Criar novo evento de tipoId 3 com minutos = 0 e tratado = true
        await this.prisma.eventos.create({
          data: {
            cartaoDiaId,
            hora: eventoTipo2.hora,
            tipoId: 3,
            funcionarioId: eventoTipo2.funcionarioId,
            minutos: 0,
            tratado: true,
          },
        });
      }
    }

    return true;
  }
}
