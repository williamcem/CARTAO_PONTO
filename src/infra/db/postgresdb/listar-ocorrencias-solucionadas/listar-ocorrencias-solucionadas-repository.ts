import { PrismaClient } from "@prisma/client";

import { CalcularResumoPostgresRepository } from "@infra/db/postgresdb/calcular-resumo/calcular-resumo-repository";

import { ListarOcorrencias } from "../../../../data/usecase/listar-ocorrencias/add-listar-ocorrencias";
import { OcorrenciasNull } from "../../../../presentation/errors/Funcionario-param-error";
import { prisma } from "../../../database/Prisma";

export class OcorrenciaSolucionadasPostgresRepository {
  private prisma: PrismaClient;
  private calcularResumoPostgresRepository: CalcularResumoPostgresRepository;

  constructor(calcularResumoPostgresRepository: CalcularResumoPostgresRepository) {
    this.prisma = prisma;
    this.calcularResumoPostgresRepository = calcularResumoPostgresRepository;
  }

  private async getEventTypeByHour(hour: string, originalTipoId: number | null): Promise<string> {
    const event = await this.prisma.eventos.findFirst({
      where: {
        hora: hour,
        NOT: { tipoId: originalTipoId },
      },
      include: { tipo_eventos: true },
    });

    return event?.tipo_eventos?.nome || "Tipo de evento não encontrado";
  }

  public async find(
    identificacao: string,
    localidade: string,
    referencia: Date,
  ): Promise<{
    funcionarios: {
      identificacao: string;
      nome: string;
      turno: { nome: string };
      localidade: { codigo: string };
      referencia: Date | null;
      dias: {
        data: Date;
        eventos: {
          id: number;
          cartaoDiaId: number;
          hora: string;
          funcionarioId: number;
          minutos: number;
          tipoId: number;
          tratado: boolean;
          solucaoDada: string;
        }[];
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
          where: { referencia },
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

    const funcionariosComEventos = await Promise.all(
      funcionarios.map(async (funcionario) => {
        const diasComEventos = (
          await Promise.all(
            funcionario.cartao.flatMap((cartao) =>
              cartao.cartao_dia.map(async (cartao_dia) => {
                const eventos = cartao_dia.eventos.filter((evento) => {
                  if ((evento.tipoId === 2 || evento.tipoId === 8) && evento.tratado) return true;
                  return false;
                });

                const eventosComSolucaoDada = await Promise.all(
                  eventos.map(async (evento) => {
                    const solucaoDada = await this.getEventTypeByHour(evento.hora, evento.tipoId);
                    return {
                      id: evento.id,
                      cartaoDiaId: evento.cartaoDiaId,
                      hora: evento.hora,
                      funcionarioId: evento.funcionarioId,
                      minutos: evento.minutos,
                      tipoId: evento.tipoId as number,
                      tratado: evento.tratado,
                      solucaoDada,
                    };
                  }),
                );

                return {
                  data: cartao_dia.data,
                  eventos: eventosComSolucaoDada,
                  lancamentos: cartao_dia.cartao_dia_lancamentos.map((lancamento) => ({
                    periodoId: lancamento.periodoId,
                    entrada: lancamento.entrada,
                    saida: lancamento.saida,
                  })),
                };
              }),
            ),
          )
        ).filter((dia) => dia.eventos.length > 0);

        const resumo = this.calcularResumoPostgresRepository.calcularResumoPublico({ cartao: funcionario.cartao });

        return {
          identificacao: funcionario.identificacao,
          nome: funcionario.nome,
          turno: { nome: funcionario.turno.nome },
          localidade: { codigo: funcionario.localidade.codigo },
          referencia: funcionario.cartao.length > 0 ? funcionario.cartao[0].referencia : null,
          dias: diasComEventos,
          Resumo: resumo,
        };
      }),
    );

    return { funcionarios: funcionariosComEventos };
  }
}
