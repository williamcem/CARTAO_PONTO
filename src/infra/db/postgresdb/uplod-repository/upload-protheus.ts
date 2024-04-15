import { PrismaClient } from "@prisma/client";
import { AddUploadRepository } from "../../../../data/usecase/upload-protheus/add-upload-prothues-repository";
import { AddUploadModel } from "../../../../domain/usecases/add-upload";
import { Uploadmodel } from "../../../../domain/models/upload-protheus";

export class UploadPostgresRepository implements AddUploadRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  public async add(protheusData: AddUploadModel[]): Promise<Uploadmodel> {
    // Transformar protheusData em um array de objetos para inserção em lote
    const dataToInsert = protheusData.map((item) => ({
      id: item.id,
      dado1: item.dado1,
      dado2: item.dado2,
      dado3: item.dado3,
      dado4: item.dado4,
      dado5: item.dado5,
      dado6: item.dado6,
    }));

    try {
      // Salvar os dados em lote
      const saved = await this.prisma.receberdados.createMany({
        data: dataToInsert,
      });

      console.log(saved);
      console.log("Dados salvos no banco de dados com sucesso.");

      return {
        saved: Boolean(saved.count),
      };
    } catch (error) {
      console.error("Erro ao salvar os dados no banco de dados:", error);
      return { saved: false };
    } finally {
      await this.prisma.$disconnect(); // Fecha a conexão com o banco de dados
    }
  }
}
