import { PrismaClient } from "@prisma/client";

import { prisma } from "../../../database/Prisma";

export class FuncionarioImpressaoCalculoPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findAllByLocalidade(localidade: string, funcionarioId?: number[]) {
    const funcionarios = await this.prisma.funcionario.findMany({
      where: { localidadeId: localidade, id: { in: funcionarioId } },
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
                eventos: true,
                atestado_abonos: true,
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
        centro_custo: true,
      },
      orderBy: { id: "asc" },
    });

    // Retorna os funcionários mapeados
    return funcionarios;
  }
}
