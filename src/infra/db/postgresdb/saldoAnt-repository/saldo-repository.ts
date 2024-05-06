import { PrismaClient } from "@prisma/client";
import { AddSaldoAntRepository } from "../../../../data/usecase/saldoAnt/add-saldo-ant-repository";
import { AddSaldoAntModel } from "../../../../domain/usecases/add-saldo-ant.ts";
import { prisma } from "../../../database/Prisma"

export class SaldoPostgresRepository implements AddSaldoAntRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async addSaldoAnt(saldoAntData: AddSaldoAntModel): Promise<void> {
    try {
      const { id, saldoAnt } = saldoAntData;

      await this.prisma.dia.update({
        where: {
          id: id,
        },
        data: {
          saldoAnt: saldoAnt,
        },
      });
    } catch (error) {
      console.error("Erro do Prisma:", error);
      throw new Error("Erro ao adicionar saldo anterior");
    }
  }
}
