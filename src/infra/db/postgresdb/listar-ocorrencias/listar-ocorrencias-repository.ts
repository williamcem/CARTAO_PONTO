import { PrismaClient } from "@prisma/client";
import { ListarOcorrencias } from "../../../../data/usecase/listar-ocorrencias/add-listar-ocorrencias";
import { prisma } from "../../../database/Prisma";

export class OcorrenciaPostgresRepository implements ListarOcorrencias {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async find(localidade: string): Promise<{ funcionarios: { identificacao: string; cartao: any; nome: string }[] }> {
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
      },
      orderBy: { id: "asc" },
    });

    if (!funcionarios) return { funcionarios: [] };

    return {
      funcionarios: funcionarios.map((funcionario) => ({
        identificacao: funcionario.identificacao,
        cartao: funcionario.cartao,
        nome: funcionario.nome,
      })),
    };
  }
}
