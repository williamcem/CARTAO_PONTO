import { PrismaClient } from "@prisma/client";

import { prisma, prismaPromise } from "../../../database/Prisma";

export class LancarFaltaPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findFisrt(input: { cartaoDiaId: number }) {
    return await this.prisma.cartao_dia.findFirst({
      where: { id: input.cartaoDiaId },
      include: {
        cartao: {
          include: {
            funcionario: true,
          },
        },
        eventos: true,
        cartao_dia_lancamentos: true,
      },
    });
  }

  public async createEvento(
    input: {
      hora: string;
      minutos: number;
      tipoId: number;
      cartaoDiaId: number;
      funcionarioId: number;
    }[],
  ) {
    const queries: prismaPromise[] = [];

    input.map((evento) => {
      queries.push(
        this.prisma.eventos.create({
          data: {
            hora: evento.hora,
            minutos: evento.minutos,
            tipoId: evento.tipoId,
            cartaoDiaId: evento.cartaoDiaId,
            funcionarioId: evento.funcionarioId,
          },
        }),
      );
      return undefined;
    });

    return Boolean((await this.prisma.$transaction(queries)).length);
  }

  public async findFisrtEvento(input: {
    hora: string;
    minutos: number;
    tipoId: number;
    cartaoDiaId: number;
    funcionarioId: number;
  }) {
    return await this.prisma.eventos.findFirst({
      where: {
        hora: input.hora,
        minutos: input.minutos,
        tipoId: input.tipoId,
        cartaoDiaId: input.cartaoDiaId,
        funcionarioId: input.funcionarioId,
      },
    });
  }
}
