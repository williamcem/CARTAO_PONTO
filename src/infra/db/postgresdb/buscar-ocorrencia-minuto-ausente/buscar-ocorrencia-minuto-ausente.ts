import { PrismaClient } from "@prisma/client";

import { GetFuncionarioAtestado } from "../../../../data/usecase/procurar-funcionario/find-procurar-funcionario";
import { prisma } from "../../../database/Prisma";

export class BuscarOcorrenciaMinutoAusentePostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findFisrtFuncionario(input: { identificacao: string }) {
    return await this.prisma.funcionario.findFirst({
      where: { identificacao: input.identificacao },
      select: {
        id: true,
        nome: true,
      },
    });
  }

  public async findFisrtCartao(input: { funcionarioId: number; referencia: Date }) {
    return await this.prisma.cartao.findFirst({
      where: { funcionarioId: input.funcionarioId, referencia: input.referencia },
      select: {
        id: true,
      },
    });
  }
}
