import { PrismaClient } from "@prisma/client";

import { DelDeleteCartoaRepository } from "../../../../data/usecase/delete-cartao/add-delete-cartoa-repository";
import { DelDeleteCartoa } from "../../../../domain/usecases/delete-cartao";
import { prisma } from "../../../database/Prisma";

export class DeleteCartaoPostgresRepository implements DelDeleteCartoaRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async deleteByReferencia(deleteReferencia: DelDeleteCartoa): Promise<void> {
    try {
      const { referencia } = deleteReferencia;

      // Convertendo a string de referência para Date
      const referenceDate = new Date(referencia);
      const nextDay = new Date(referenceDate);
      nextDay.setDate(referenceDate.getDate() + 1);

      await this.prisma.cartao.deleteMany({
        where: {
          referencia: {
            gte: referenceDate,
            lt: nextDay,
          },
        },
      });
    } catch (error) {
      console.error("Erro ao deletar o cartão do mês", error);
      throw new Error("Erro ao deletar o cartão do mês");
    }
  }
}
