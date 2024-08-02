import { PrismaClient } from "@prisma/client";

import { CalcularResumoPostgresRepository } from "@infra/db/postgresdb/calcular-resumo/calcular-resumo-repository";

import { ListarOcorrencias } from "../../../../data/usecase/listar-ocorrencias/add-listar-ocorrencias";
import { OcorrenciasNull } from "../../../../presentation/errors/Funcionario-param-error";
import { prisma } from "../../../database/Prisma";

export class OcorrenciaSolucionadasPostgresRepository implements ListarOcorrencias {
  private prisma: PrismaClient;
  private calcularResumoPostgresRepository: CalcularResumoPostgresRepository;

  constructor(calcularResumoPostgresRepository: CalcularResumoPostgresRepository) {
    this.prisma = prisma;
    this.calcularResumoPostgresRepository = calcularResumoPostgresRepository;
  }

  public async find(
    identificacao: string,
    localidade: string,
  ): Promise<{
    funcionarios: {
      identificacao: string;
      nome: string;
      turno: { nome: string };
      localidade: { codigo: string };
      referencia: Date | null;
      dias: {
        data: Date;
        eventos: any[];
        lancamentos: { periodoId: number; entrada: Date | null; saida: Date | null }[];
      }[];
      Resumo: any;
    }[];
  }> {
    const funcionarios = await this.prisma.funcionario.findMany({
      where: {
        identificacao: identificacao,
        localidadeId: localidade,
        cartao: { some: { cartao_dia: { some: { cartao_dia_lancamentos: { some: { validadoPeloOperador: true } } } } } },
      },
      include: {
        cartao: {
          select: {
            referencia: true,
            cartao_dia: {
              include: {
                eventos: true,
                cartao_dia_lancamentos: {
                  select: {
                    periodoId: true,
                    entrada: true,
                    saida: true,
                  },
                },
              },
              orderBy: { id: "asc" },
            },
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

    if (!funcionarios || funcionarios.length === 0) {
      throw new OcorrenciasNull("Nenhuma ocorrencia encontrada para o funcionario");
    }

    return {
      funcionarios: await Promise.all(
        funcionarios.map(async (funcionario) => {
          const diasComEventos = funcionario.cartao.flatMap((cartao) =>
            cartao.cartao_dia
              .map((cartao_dia) => {
                const eventos = cartao_dia.eventos.filter((evento) => {
                  if ((evento.tipoId === 2 || evento.tipoId === 8) && evento.tratado) return true;
                  return false;
                });

                return {
                  data: cartao_dia.data,
                  eventos,
                  lancamentos: cartao_dia.cartao_dia_lancamentos.map((lancamento) => ({
                    periodoId: lancamento.periodoId,
                    entrada: lancamento.entrada,
                    saida: lancamento.saida,
                  })),
                };
              })
              .filter((dia) => dia.eventos.length > 0),
          );

          const resumo = this.calcularResumoPostgresRepository.calcularResumoPublico({ cartao: funcionario.cartao });

          return {
            identificacao: funcionario.identificacao,
            nome: funcionario.nome,
            turno: funcionario.turno,
            localidade: funcionario.localidade,
            referencia: funcionario.cartao.length > 0 ? funcionario.cartao[0].referencia : null,
            dias: diasComEventos,
            Resumo: resumo,
          };
        }),
      ),
    };
  }
}
