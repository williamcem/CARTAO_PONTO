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
      },
    });
  }

  public async findFisrtOcorrencia(input: { id: number }) {
    return await this.prisma.eventos.findFirst({
      where: { id: input.id },
      select: { id: true, funcionarioId: true },
    });
  }

  public async updateOcorrencia(input: { id: number; atestadoId: number }) {
    return await this.prisma.eventos.update({
      where: { id: input.id },
      data: { atestadoFuncionarioId: input.atestadoId },
    });
  }
}
