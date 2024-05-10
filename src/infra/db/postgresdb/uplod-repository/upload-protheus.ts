import { PrismaClient } from "@prisma/client";
import { AddUploadRepository } from "../../../../data/usecase/upload-protheus/add-upload-prothues-repository";
import { AddUploadModel } from "../../../../domain/usecases/add-upload";
import { Uploadmodel } from "../../../../domain/models/upload-protheus";
import { randomUUID } from "crypto";
import { prisma } from "../../../database/Prisma";

export class UploadPostgresRepository implements AddUploadRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async add(protheusData: AddUploadModel[]): Promise<Uploadmodel> {
    // Transformar protheusData em um array de objetos para inserção em lote
    const date = new Date();
    date.setHours(date.getHours() - 3);

    const dataToInsert = protheusData.map((item) => {
      return {
        id: item.id,
        mes: item.mes,
        data: item.data,
        diaSemana: item.diaSemana,
        status: item.status,
        nome: item.nome,
        matricula: item.matricula,
        setor: item.setor,
        expediente: item.expediente,
        saldoanterior: item.saldoanterior,
        dia: {
          create: {
            id: randomUUID(),
            dif_min: 0,
            entradaManha: "",
            entradaTarde: "",
            saidaManha: "",
            saidaTarde: "",
            saldoAnt: 0,
            entradaExtra: "",
            saidaExtra: "",
            dataInicio: date,
          },
        },
      };
    });

    try {
      // Salvar os dados em lote
      const query = dataToInsert.map((dados) => {
        return this.prisma.receberdados.create({
          data: dados,
        });
      });
      const saved = await this.prisma.$transaction(query);

      return {
        saved: Boolean(saved.length),
      };
    } catch (error) {
      console.error("Erro ao salvar os dados no banco de dados:", error);
      return { saved: false };
    } finally {
      await this.prisma.$disconnect(); // Fecha a conexão com o banco de dados
    }
  }
}
