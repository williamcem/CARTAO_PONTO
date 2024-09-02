import { PrismaClient } from "@prisma/client";

import { OcorrenciasNull } from "../../../../presentation/errors/Funcionario-param-error";
import { prisma } from "../../../database/Prisma";

export class OcorrenciaGeralSolucionadaPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  public async findOcorrencia(
    localidade: string,
    referencia: string,
  ): Promise<{
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
                  where: { AND: [{ tratado: true }, { OR: [{ tipoId: 2 }, { tipoId: 8 }] }] },
                },
              },
              orderBy: { id: "asc" },
            },
          },
          where: { referencia },
          orderBy: { id: "asc" },
        },
      },
      orderBy: { id: "asc" },
    });

    if (!funcionarios || funcionarios.length === 0)
      throw new OcorrenciasNull("Nenhuma funcionario da localidade apresenta ocorrencias solucionadas");

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
