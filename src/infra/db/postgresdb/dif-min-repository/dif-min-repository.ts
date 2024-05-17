import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../database/Prisma";
import { AddDifMin, AddDifMinModel } from "../../../../presentation/controllers/dif-min/dif-min-protocols";

interface DiaUpdate {
  id: string;
  entradaManha?: string;
  saidaManha?: string;
  entradaTarde?: string;
  saidaTarde?: string;
}

export class DifMinPostgresRepository implements AddDifMin {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async buscarPorId(input: { id: string }): Promise<AddDifMinModel | undefined> {
    const result = await this.prisma.dia.findFirst({ where: { id: input.id } });

    if (!result) return undefined;

    return {
      id: result.id,
      entradaManha: result.entradaManha,
      entradaTarde: result.entradaTarde,
      saidaManha: result.saidaManha,
      saidaTarde: result.saidaTarde,
    };
  }

  async atualizarDiaParaFalta(difData: DiaUpdate): Promise<boolean> {
    try {
      const { id, entradaManha, saidaManha, entradaTarde, saidaTarde } = difData;
      // Atualiza o registro no banco de dados
      await this.prisma.dia.update({
        where: { id },
        data: {
          ...{ entradaManha, saidaManha, entradaTarde, saidaTarde },
        },
      });

      return true;
    } catch (error) {
      console.error("Erro ao atualizar o dia para falta:", error);
      throw new Error("Erro ao atualizar o dia para falta");
    }
  }
}
