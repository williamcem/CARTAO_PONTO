import { PrismaClient } from "@prisma/client";
import { DelDeleteRepository } from "../../../../data/usecase/delete/add-delete-repository";
import { DelDeleteModel } from "../../../../domain/usecases/delete-horarios";
import { prisma } from "../../../database/Prisma";

export class DeletePostgresRepository implements DelDeleteRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async deleteById(deleteData: DelDeleteModel): Promise<void> {
    try {
      const { id } = deleteData; // Extrair o ID do objeto deleteData
      await this.prisma.dia.updateMany({
        where: {
          id: id, // Usar o ID fornecido
        },
        data: {
          entradaManha: "", // Define o campo como vazio (string vazia)
          saidaManha: "",
          entradaTarde: "",
          saidaTarde: "",
          entradaExtra: "",
          saidaExtra: "",
          dif_min: 0,
          saldoAnt: 0,
        },
      });
    } catch (error) {
      console.error("Erro ao deletar horário:", error);
      throw new Error("Erro ao deletar horário");
    }
  }
}