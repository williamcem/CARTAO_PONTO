import { PrismaClient } from "@prisma/client";

export class SaldoAntRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async updateSaldoAnt(id: string, novoSaldoAnt: number): Promise<void> {
    try {
      await this.prisma.dia.update({
        where: { id },
        data: { saldoAnt: novoSaldoAnt },
      });
    } catch (error) {
      console.error("Erro do Prisma:", error);
      throw new Error("Erro ao atualizar o saldoAnt no banco de dados");
    }
  }
}
