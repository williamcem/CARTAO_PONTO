import { PrismaClient } from "@prisma/client";

import { ListarOcorrenciasGeral } from "../../../../data/usecase/listar-ocorrencias/add-listar-ocorrencias";
import { prisma } from "../../../database/Prisma";
import { OcorrenciasNull } from "../../../../presentation/errors/Funcionario-param-error";

export class OcorrenciaGeralPostgresRepository implements ListarOcorrenciasGeral {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findOcorrencia(localidade: string): Promise<{
    funcionarios: {
      identificacao: string;
      nome: string;
    }[];
  }> {
    const funcionarios = await this.prisma.funcionario.findMany({
      where: {
        localidadeId: localidade,
        cartao: { some: { cartao_dia: { some: { cartao_dia_lancamentos: { some: { validadoPeloOperador: true } } } } } },
      },
      include: {
        cartao: {
          include: {
            cartao_dia: {
              include: {
                eventos: {
                  where: { tipoId: 2, tratado: false },
                },
              },
              orderBy: { id: "asc" },
            },
          },
          orderBy: { id: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });

    if (!funcionarios || funcionarios.length === 0) {
      throw new OcorrenciasNull("Nenhuma funcionario da localidade apresenta ocorrencias");
    }
    return {
      funcionarios: funcionarios
        .map((funcionario) => {
          const hasValidEvent = funcionario.cartao.some((cartao) =>
            cartao.cartao_dia.some((cartao_dia) => cartao_dia.eventos.length > 0),
          );

          if (hasValidEvent) {
            return {
              identificacao: funcionario.identificacao,
              nome: funcionario.nome,
            };
          }
          return null;
        })
        .filter((funcionario) => funcionario !== null) as {
        identificacao: string;
        nome: string;
      }[],
    };
  }
}
