import { PrismaClient } from "@prisma/client";

import { prisma, prismaPromise } from "../../../database/Prisma";

export class AssociarOcorrenciaComAtestadoPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findFisrtAtestado(input: { id: number }) {
    return await this.prisma.atestado_funcionario.findFirst({
      where: { id: input.id },
      select: {
        id: true,
        funcionarioId: true,
        statusId: true,
        acao: true,
      },
    });
  }

  public async findFisrtOcorrencia(input: { id: number }) {
    return await this.prisma.eventos.findFirst({
      where: { id: input.id },
    });
  }

  public async updateManyOcorrencia(input: {
    ids: number[];
    atestadoId: number;
    eventos?: {
      updateMany: { id: number; tratado: boolean }[];
      createMany: {
        cartaoDiaId: number;
        funcionarioId: number;
        hora: string;
        minutos: number;
        tipoId: number;
        tratado: boolean;
        atestadoFuncionarioId?: number | null;
      }[];
    };
  }) {
    const queries: prismaPromise[] = [];

    input.ids.map((id) => {
      queries.push(
        this.prisma.eventos.update({
          where: { id },
          data: { atestadoFuncionarioId: input.atestadoId },
        }),
      );
    });

    input.eventos?.createMany.map((evento) =>
      queries.push(
        this.prisma.eventos.create({
          data: { ...evento },
        }),
      ),
    );

    input.eventos?.updateMany.map((evento) =>
      queries.push(
        this.prisma.eventos.update({
          where: { id: evento.id },
          data: {
            tratado: evento.tratado,
          },
        }),
      ),
    );

    return Boolean((await this.prisma.$transaction(queries)).length);
  }
}
