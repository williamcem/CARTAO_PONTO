import { PrismaClient } from "@prisma/client";

import { GetFuncionarioAtestado } from "../../../../data/usecase/procurar-funcionario/find-procurar-funcionario";
import { prisma } from "../../../database/Prisma";

export class FuncionarioAtestadoPostgresRepository implements GetFuncionarioAtestado {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async atestadoFuncionario(identificacao: string): Promise<any> {
    const funcionario = await this.prisma.funcionario.findFirst({
      where: { identificacao: { endsWith: identificacao } },
      include: {
        cartao: {
          include: {
            cartao_dia: {
              include: {
                cartao_dia_lancamentos: {
                  include: {
                    cartao_dia_lancamento_status: true, // Inclui a tabela 'cartao_dia_lancamento_status'
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
        turno: true, // Inclui a tabela 'turno' nos resultados
        localidade: true, // Inclui a tabela 'localidade' nos resultados
        funcao: true, // Inclui a tabela 'localidade' nos resultados
        afastamento: {
          include: { funcionarios_afastados_status: true },
        },
      },
      orderBy: { id: "asc" },
    });

    // Verifica se o funcionário foi encontrado
    if (!funcionario) return undefined;

    // Retorna o funcionário mapeado
    return funcionario;
  }
}
