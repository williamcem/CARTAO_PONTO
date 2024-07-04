import { PrismaClient } from "@prisma/client";

import { DelDeleteRepository } from "../../../../data/usecase/delete-dia-horarios/add-delete-repository";
import { DelDeleteModel } from "../../../../domain/usecases/delete-dia-horarios";
import { prisma } from "../../../database/Prisma";

export class DeletePostgresRepository implements DelDeleteRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async deleteById(deleteData: DelDeleteModel): Promise<void> {
    try {
      const { cartao_dia_id } = deleteData;

      // Deletar registros correspondentes na tabela cartao_dia_lancamento
      await this.prisma.cartao_dia_lancamento.deleteMany({
        where: {
          cartao_dia_id,
        },
      });

      // Atualizar o campo 'tratado' para false na tabela cartao_dia
      await this.prisma.cartao_dia.update({
        where: {
          id: cartao_dia_id,
        },
        data: {
          tratado: false,
        },
      });
    } catch (error) {
      console.error("Erro ao deletar horário:", error);
      throw new Error("Erro ao deletar horário");
    }
  }
}
