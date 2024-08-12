import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../database/Prisma";

export class FuncionarioPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findFisrt(identificacao: string, localidade: string) {
    const funcionario = await this.prisma.funcionario.findFirst({
      where: { identificacao: { endsWith: identificacao }, localidadeId: localidade },
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
                eventos: true,
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
