import { PrismaClient } from "@prisma/client";
import { GetFuncionarioIdent } from "../../../../data/usecase/procurar-funcionario/find-procurar-funcionario";
import { GetFuncionarioModel } from "../../../../domain/models/get-funcionário";
import { prisma } from "../../../database/Prisma";

export class FuncionarioPostgresRepository implements GetFuncionarioIdent {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findFisrt(identificacao: string, localidade: string): Promise<GetFuncionarioModel | undefined> {
    const funcionario = await this.prisma.funcionario.findFirst({
      where: { identificacao: { endsWith: identificacao }, localidadeId: localidade },
      include: {
        cartao: {
          include: { cartao_dia: { include: { cartao_dia_lancamentos: true, cartao_dia_status: true } }, cartao_status: true },
        },
      },
    });

    // Verifica se o funcionário foi encontrado
    if (!funcionario) return undefined;

    // Retorna o funcionário encontrado em um array
    return funcionario;
  }
}
