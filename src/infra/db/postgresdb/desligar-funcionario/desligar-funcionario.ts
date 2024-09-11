import { PrismaClient } from "@prisma/client";

import { prisma, prismaPromise } from "../../../database/Prisma";

export class DesligarFuncionarioPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findFisrtFuncionario(input: { id: number }) {
    return await this.prisma.funcionario.findFirst({
      where: {
        id: input.id,
      },
      select: {
        id: true,
        cartao: {
          where: {
            statusId: 1,
          },
          select: {
            id: true,
          },
        },
        funcionario_desligado: {
          select: { id: true },
        },
      },
    });
  }

  public async create(input: { data: Date; funcionarioId: number; cartoes: { id: number; statusId: number }[] }) {
    const queries: prismaPromise[] = [];
    queries.push(
      this.prisma.funcionario_desligado.create({
        data: {
          data: input.data,
          funcionarioId: input.funcionarioId,
        },
      }),
    );

    input.cartoes.map((cartao) => {
      queries.push(
        this.prisma.cartao.update({
          where: { id: cartao.id },
          data: { statusId: cartao.statusId },
        }),
      );
    });

    return Boolean((await this.prisma.$transaction(queries)).length);
  }
}
