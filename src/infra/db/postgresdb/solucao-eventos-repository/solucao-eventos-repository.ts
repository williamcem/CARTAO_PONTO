import { PrismaClient } from "@prisma/client";

import { AdicionarSolucao } from "../../../../data/usecase/add-solucao-eventos/add-solucao-eventos";
import { prisma, prismaPromise } from "../../../database/Prisma";
import moment from "moment";

export class SolucaoEventoRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async add(
    input: { funcionarioId: number; cartaoDiaId: number; tipoId: number; minutos: number; inicio: Date; fim: Date }[],
  ): Promise<boolean> {
    const queries: prismaPromise[] = [];

    const create: {
      cartaoDiaId: number;
      hora: string;
      tipoId: number;
      funcionarioId: number;
      minutos: number;
      tratado: boolean;
    }[] = [];

    for (const { funcionarioId, cartaoDiaId, tipoId, minutos: minutosOriginal, inicio, fim } of input) {
      let minutos = this.calcularMinutosBaseadoNaAcao({ minutosOriginal: minutosOriginal, tipoId });

      // Cria novo evento
      queries.push(
        this.prisma.eventos.create({
          data: {
            hora: `${moment.utc(inicio).format("HH:mm")} -${moment.utc(fim).format("HH:mm")}`,
            minutos,
            cartaoDiaId,
            inicio,
            fim,
            tipoId,
            tratado: false,
            funcionarioId,
          },
        }),
      );

      /*       const existDuplicateCreate = create.some(
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
      } */
    }

    /*     create.map((evento) => {
      queries.push(
        this.prisma.eventos.create({
          data: evento,
        }),
      );
    }); */

    return Boolean((await this.prisma.$transaction(queries)).length);
  }

  public async findFisrtDia(input: { id: number }) {
    return await this.prisma.cartao_dia.findFirst({
      where: {
        id: input.id,
      },
      select: {
        id: true,
        cartao: {
          select: { funcionarioId: true },
        },
      },
    });
  }

  calcularMinutosBaseadoNaAcao(input: { tipoId: number; minutosOriginal: number }) {
    //Mantem minutos original positivo
    /*     let minutos = 0;
    if (input.tipoId === 3 || input.tipoId === 7) minutos = 0;
    else if (input.tipoId === 5 || input.tipoId === 6 || input.tipoId === 12) minutos = Math.abs(input.minutosOriginal);
    else minutos = input.minutosOriginal; */

    return Math.abs(input.minutosOriginal);
  }

  async findFisrEvento(input: { inicio: Date; fim: Date; tipoId: number; cartaoDiaId: number }) {
    return await this.prisma.eventos.findFirst({
      where: { ...input },
    });
  }
}
