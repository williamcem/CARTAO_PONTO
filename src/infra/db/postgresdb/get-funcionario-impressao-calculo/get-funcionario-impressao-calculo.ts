import { PrismaClient } from "@prisma/client";

import { GetFuncionarioIdentCalculo } from "../../../../data/usecase/procurar-funcionario/find-procurar-funcionario";
import { prisma } from "../../../database/Prisma";

export class FuncionarioImpressaoCalculoPostgresRepository implements GetFuncionarioIdentCalculo {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findAllByLocalidade(localidade: string): Promise<any> {
    const funcionarios = await this.prisma.funcionario.findMany({
      where: { localidadeId: localidade },
      include: {
        cartao: {
          include: {
            cartao_dia: {
              include: {
                cartao_dia_lancamentos: {
                  include: {
                    cartao_dia_lancamento_status: true,
                  },
                },
                cartao_dia_status: true,
              },
              orderBy: { id: "asc" },
            },
            cartao_status: true,
          },
          orderBy: { id: "asc" },
        },
        turno: true,
        localidade: true,
        afastamento: {
          include: { funcionarios_afastados_status: true },
        },
      },
      orderBy: { id: "asc" },
    });
    console.log("Bateu");

    // Retorna os funcionários mapeados
    return funcionarios;
  }
}
