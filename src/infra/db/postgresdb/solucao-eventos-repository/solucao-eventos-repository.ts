import { PrismaClient } from "@prisma/client";

import { AdicionarSolucao } from "../../../../data/usecase/add-solucao-eventos/add-solucao-eventos";
import { prisma, prismaPromise } from "../../../database/Prisma";

export class SolucaoEventoRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async add(input: { id: number; tipoId: number }[]): Promise<boolean> {
    const queries: prismaPromise[] = [];

    const create: {
      cartaoDiaId: number;
      hora: string;
      tipoId: number;
      funcionarioId: number;
      minutos: number;
      tratado: boolean;
    }[] = [];

    for (const { id, tipoId } of input) {
      const eventoOriginal = await this.prisma.eventos.findUnique({
        where: { id: id },
      });

      if (!eventoOriginal) throw new Error("Evento original não encontrado");

      let minutos = this.calcularMinutosBaseadoNaAcao({ minutosOriginal: eventoOriginal.minutos, tipoId });

      // Atualizar o evento original para definir tratado como true
      queries.push(
        this.prisma.eventos.update({
          where: { id: id },
          data: { tratado: true },
        }),
      );

      const existDuplicateCreate = create.some(
        (e) =>
          e.cartaoDiaId === eventoOriginal.cartaoDiaId &&
          e.hora === eventoOriginal.hora &&
          e.tipoId === tipoId &&
          e.funcionarioId === eventoOriginal.funcionarioId &&
          e.minutos === minutos &&
          e.tratado === true,
      );

      if (!existDuplicateCreate)
        // Cria o novo evento com os valores apropriados
        create.push({
          cartaoDiaId: eventoOriginal.cartaoDiaId,
          hora: eventoOriginal.hora,
          tipoId: tipoId,
          funcionarioId: eventoOriginal.funcionarioId,
          minutos: minutos,
          tratado: true, // Define tratado como true no novo evento
        });

      // Verifica se é necessário criar eventos adicionais para tipoId 3 ou 6
      if (tipoId === 3 || tipoId === 6 || tipoId === 5) {
        // Verificar e criar eventos para minutos entre -1 e -5
        const eventosEntreMenos1EMenos5 = await this.prisma.eventos.findMany({
          where: {
            cartaoDiaId: eventoOriginal.cartaoDiaId,
            id: { not: id },
            tipoId: {
              in: [2],
            },
            minutos: { gte: -5, lte: -1 },
            tratado: false,
          },
        });

        for (const evento of eventosEntreMenos1EMenos5) {
          queries.push(
            this.prisma.eventos.update({
              where: { id: evento.id },
              data: { tratado: true },
            }),
          );

          const minutos = tipoId === 3 ? 0 : Math.abs(evento.minutos); // Define minutos como 0 para tipoId 3 e positivo para tipoId 6 ou 5

          const existDuplicateCreate = create.some(
            (e) =>
              e.cartaoDiaId === evento.cartaoDiaId &&
              e.hora === evento.hora &&
              e.tipoId === tipoId &&
              e.funcionarioId === evento.funcionarioId &&
              e.minutos === minutos &&
              e.tratado === true,
          );

          if (!existDuplicateCreate)
            create.push({
              cartaoDiaId: evento.cartaoDiaId,
              hora: evento.hora,
              tipoId: tipoId,
              funcionarioId: evento.funcionarioId,
              minutos,
              tratado: true,
            });
        }
      }
    }

    create.map((evento) => {
      queries.push(
        this.prisma.eventos.create({
          data: evento,
        }),
      );
    });

    return Boolean((await this.prisma.$transaction(queries)).length);
  }

  calcularMinutosBaseadoNaAcao(input: { tipoId: number; minutosOriginal: number }) {
    let minutos = 0;
    if (input.tipoId === 3 || input.tipoId === 7) minutos = 0;
    else if (input.tipoId === 5 || input.tipoId === 6 || input.tipoId === 12) minutos = Math.abs(input.minutosOriginal);
    else minutos = input.minutosOriginal;

    return minutos;
  }
}
