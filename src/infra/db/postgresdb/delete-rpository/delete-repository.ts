import { PrismaClient } from "@prisma/client";
import { DelDeleteRepository } from "../../../../data/usecase/delete/add-delete-repository";
import { DelDeleteModel } from "../../../../domain/usecases/delete-horarios";

export class DeletePostgresRepository implements DelDeleteRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async deleteById(deleteData: DelDeleteModel): Promise<void> {
    try {
      const { id } = deleteData; // Extrair o ID do objeto deleteData
      console.log("bateu");
      await this.prisma.dia.delete({
        where: {
          id: id, // Usar o ID fornecido
        },
      });
    } catch (error) {
      console.error("Erro ao deletar horário:", error);
      throw new Error("Erro ao deletar horário");
    }
  }
}
