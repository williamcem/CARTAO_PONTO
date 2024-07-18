import { PrismaClient } from "@prisma/client";

import { AddAtestadoAprovadoModel, AddAtestadoInicioFim } from "../../../../domain/usecases/add-atestatdo-aprovado";
import { prisma } from "../../../database/Prisma";

export class AtestadoAprovadoRepository implements AddAtestadoInicioFim {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async addInicioFim(input: AddAtestadoAprovadoModel): Promise<boolean> {
    try {
      const savedAtestado = await this.prisma.atestado_funcionario.update({
        where: {
          id: input.id,
        },
        data: {
          inicio: input.inicio,
          fim: input.fim,
          statusId: 2,
        },
      });

      return !!savedAtestado;
    } catch (error) {
      console.error("Erro ao atualizar atestado:", error);
      return false;
    }
  }
}
