import { PrismaClient } from "@prisma/client";

import { prisma } from "../../../database/Prisma";

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

  public async createEvento(input: {
    hora: string;
    minutos: number;
    tipoId: number;
    cartaoDiaId: number;
    funcionarioId: number;
  }) {
    return Boolean(
      await this.prisma.eventos.create({
        data: {
          hora: input.hora,
          minutos: input.minutos,
          tipoId: input.tipoId,
          cartaoDiaId: input.cartaoDiaId,
          funcionarioId: input.funcionarioId,
        },
      }),
    );
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
