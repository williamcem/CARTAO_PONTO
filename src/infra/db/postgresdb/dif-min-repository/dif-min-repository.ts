import { PrismaClient } from "@prisma/client";
import { AddDifMinRepository } from "../../../../data/usecase/add-dif-min/add-dif-min-repository";
import { DifMinModel } from "../../../../domain/models/dif-min";
import { prisma } from "../../../database/Prisma"

// Defina o tipo para representar um dia anterior
interface Dia {
  id: string;
  entradaManha: string;
  saidaManha: string;
  entradaTarde: string | null;
  saidaTarde: string | null;
  entradaExtra: string | null;
  saidaExtra: string | null;
  dif_min: number;
}

export class DifMinPostgresRepository implements AddDifMinRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async listarDiasAnteriores(difData: DifMinModel): Promise<Dia[]> {
    try {
      const { dif_min } = difData;
      const dataAtual = new Date();
      dataAtual.setHours(0, 0, 0, 0); // Define a data atual para o início do dia

      // Passo 1: Obter as datas da tabela receberdados que são anteriores à data atual e não são sábado, domingo, "COMPESADO" ou "DOMINGO"
      const datasAnteriores = await this.prisma.receberdados.findMany({
        where: {
          data: {
            lt: dataAtual,
          },
          NOT: [{ status: "COMPENSADO" }, { status: "DOMINGO" }],
        },
        select: {
          data: true,
        },
      });

      // Passo 2: Usar as datas obtidas para filtrar os registros na tabela dia
      const diasAnteriores: Dia[] = await this.prisma.dia.findMany({
        where: {
          AND: [
            {
              receberdados: { data: { in: datasAnteriores.map((data) => data.data) } },
            },
            {
              receberdados: {
                data: {
                  lt: dataAtual, // Garante que a data seja anterior à data atual
                },
              },
            },
          ],
        },
        select: {
          id: true,
          entradaManha: true,
          saidaManha: true,
          entradaTarde: true,
          saidaTarde: true,
          entradaExtra: true,
          saidaExtra: true,
          dif_min: true,
        },
      });

      // Retornar os dias anteriores para que o controller possa processá-los
      console.log("Data atual:", dataAtual);
      console.log("Datas anteriores:", datasAnteriores);
      console.log("Dias anteriores encontrados:", diasAnteriores);

      return diasAnteriores;
    } catch (error) {
      console.error("Erro ao listar dias anteriores:", error);
      throw new Error("Erro ao listar dias anteriores");
    }
  }
}
