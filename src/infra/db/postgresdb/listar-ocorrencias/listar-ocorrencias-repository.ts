import { PrismaClient } from "@prisma/client";

import { ListarOcorrencias } from "../../../../data/usecase/listar-ocorrencias/add-listar-ocorrencias";
import { prisma } from "../../../database/Prisma";

export class OcorrenciaPostgresRepository implements ListarOcorrencias {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async find(
    identificacao: string,
    localidade: string,
  ): Promise<{
    funcionarios: {
      identificacao: string;
      nome: string;
      dias: { data: Date; eventos: any[]; lancamentos: { periodoId: number; entrada: Date | null; saida: Date | null }[] }[];
    }[];
  }> {
    const funcionarios = await this.prisma.funcionario.findMany({
      where: {
        identificacao: identificacao,
        localidadeId: localidade,
      },
      include: {
        cartao: {
          include: {
            cartao_dia: {
              include: {
                eventos: {
                  where: { tipoId: 2, tratado: false },
                },
                cartao_dia_lancamentos: {
                  select: {
                    periodoId: true,
                    entrada: true,
                    saida: true,
                  },
                }, // Include only the specified fields
              },
              orderBy: { id: "asc" },
            },
          },
          orderBy: { id: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });

    if (!funcionarios) return { funcionarios: [] };

    return {
      funcionarios: funcionarios.map((funcionario) => ({
        identificacao: funcionario.identificacao,
        nome: funcionario.nome,
        dias: funcionario.cartao.flatMap((cartao) =>
          cartao.cartao_dia
            .filter((cartao_dia) => cartao_dia.eventos.length > 0)
            .map((cartao_dia) => ({
              data: cartao_dia.data,
              eventos: cartao_dia.eventos,
              lancamentos: cartao_dia.cartao_dia_lancamentos.map((lancamento) => ({
                periodoId: lancamento.periodoId,
                entrada: lancamento.entrada,
                saida: lancamento.saida,
              })),
            })),
        ),
      })),
    };
  }
}
