import { PrismaClient } from "@prisma/client";

import { AddAtestadoInicioFimObservacao, AddAtestadoRecusadoModel } from "../../../../domain/usecases/add-atestatdo-recusado";
import { prisma } from "../../../database/Prisma";

export class AtestadoRecusadoRepository implements AddAtestadoInicioFimObservacao {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async addObservacao(input: AddAtestadoRecusadoModel): Promise<boolean> {
    try {
      const savedAtestado = await this.prisma.atestado_funcionario.update({
        where: {
          id: input.id,
        },
        data: {
          inicio: input.inicio,
          fim: input.fim,
          statusId: 3,
          observacao: input.observacao,
        },
      });

      return !!savedAtestado;
    } catch (error) {
      console.error("Erro ao atualizar atestado:", error);
      return false;
    }
  }
}
