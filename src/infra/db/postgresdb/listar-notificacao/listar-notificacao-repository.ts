import { PrismaClient } from "@prisma/client";

import { ListarNotificacao } from "../../../../data/usecase/listar-notificacao/add-listar-notificacao";
import { prisma } from "../../../database/Prisma";

export class NotificacaoPostgresRepository implements ListarNotificacao {
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

  public async findCartaoDiaByIds(ids: number[]): Promise<any[]> {
    const cartaoDias = await this.prisma.cartao_dia.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        cartao_dia_lancamentos: {
          include: {
            cartao_dia_lancamento_status: true,
          },
        },
        cartao_dia_status: true,
      },
    });
    return cartaoDias;
  }
}