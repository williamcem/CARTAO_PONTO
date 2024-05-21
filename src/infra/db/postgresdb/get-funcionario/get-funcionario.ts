import { PrismaClient } from "@prisma/client";
import { GetFuncionarioIdent } from "../../../../data/usecase/procurar-funcionario/find-procurar-funcionario";
import { GetFuncionarioModel } from "../../../../domain/models/get-funcionário";
import { prisma } from "../../../database/Prisma";

export class FuncionarioPostgresRepository implements GetFuncionarioIdent {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async list(identificacao: string): Promise<GetFuncionarioModel[]> {
    try {
      const funcionario = await this.prisma.funcionario.findUnique({
        where: { identificacao },
      });

      // Verifica se o funcionário foi encontrado
      if (!funcionario) {
        throw new Error("Identificador não encontrado");
      }

      // Retorna o funcionário encontrado em um array
      return [funcionario];
    } catch (error) {
      console.error("Erro ao buscar o identificador", error);
      // Lança a exceção novamente para que o chamador possa lidar com ela
      throw error;
    }
  }
}
