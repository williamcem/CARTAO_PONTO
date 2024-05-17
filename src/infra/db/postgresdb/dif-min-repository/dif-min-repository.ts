import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../database/Prisma";
import { AddDifMin } from "../../../../presentation/controllers/dif-min/dif-min-protocols";

interface DiaUpdate {
  id: string;
  dif_min: number;
  entradaManha: string;
  saidaManha: string;
  entradaTarde: string | null;
  saidaTarde: string | null;
  entradaExtra: string | null;
  saidaExtra: string | null;
}

export class DifMinPostgresRepository implements AddDifMin {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async atualizarDiaParaFalta(diaUpdate: DiaUpdate): Promise<boolean> {
    try {
      const { id, dif_min, entradaManha, saidaManha, entradaTarde, saidaTarde, entradaExtra, saidaExtra } = diaUpdate;

      // Atualiza o registro no banco de dados
      const updated = await this.prisma.dia.update({
        where: { id },
        data: {
          dif_min,
          entradaManha,
          saidaManha,
          entradaTarde,
          saidaTarde,
          entradaExtra,
          saidaExtra,
        },
      });

      return Boolean(updated);
    } catch (error) {
      console.error("Erro ao atualizar o dia para falta:", error);
      throw new Error("Erro ao atualizar o dia para falta");
    }
  }
}
