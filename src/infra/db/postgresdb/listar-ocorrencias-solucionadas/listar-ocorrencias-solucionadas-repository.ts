import { PrismaClient } from "@prisma/client";

import { CalcularResumoPostgresRepository } from "@infra/db/postgresdb/calcular-resumo/calcular-resumo-repository";

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
      }[];
    }[];
  }> {
    const funcionarios = await this.prisma.funcionario.findMany({
      where: {
        identificacao: identificacao,
        localidadeId: localidade,
        cartao: { some: { cartao_dia: { some: { validadoPeloOperador: true } }, referencia } },
        eventos: { some: { tipoId: { not: 1 } } },
      },
      include: {
        cartao: {
          select: {
            referencia: true,
            cartao_dia: {
              include: {
                eventos: { include: { atestado_funcionario: true } },
              },
            },
          },
        },
      },
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

                    const atestado = evento.atestado_funcionario
                      ? { id: evento.atestado_funcionario.id, statusId: evento.atestado_funcionario.statusId }
                      : undefined;

                    return {
                      id: evento.id,
                      cartaoDiaId: evento.cartaoDiaId,
                      hora: evento.hora,
                      funcionarioId: evento.funcionarioId,
                      minutos: evento.minutos,
                      tipoId: evento.tipoId as number,
                      tratado: evento.tratado,
                      solucaoDada,
                      atestado,
                    };
                  }),
                );

                return {
                  data: cartao_dia.data,
                  eventos: eventosComSolucaoDada,
                };
              }),
            ),
          )
        ).filter((dia) => dia.eventos.length > 0);

        const resumo = this.calcularResumoPostgresRepository.calcularResumoPublico({ cartao: funcionario.cartao });

        return {
          identificacao: funcionario.identificacao,
          nome: funcionario.nome,
          referencia: funcionario.cartao.length > 0 ? funcionario.cartao[0].referencia : null,
          dias: diasComEventos,
          Resumo: resumo,
        };
      }),
    );

    return { funcionarios: funcionariosComEventos };
  }

  public async findFisrtFuncionario(identificacao: string, localidade: string) {
    return await this.prisma.funcionario.findFirst({
      where: {
        identificacao,
        localidadeId: localidade,
      },
    });
  }

  public async findManyEvento(input: { funcionarioId: number; referencia: Date; tipo: { notIn: number[] } }) {
    return await this.prisma.eventos.findMany({
      where: {
        cartao_dia: { cartao: { funcionarioId: input.funcionarioId, referencia: input.referencia } },
        tipoId: { notIn: input.tipo.notIn },
      },
      select: {
        id: true,
        hora: true,
        minutos: true,
        tipo_eventos: { select: { nome: true } },
        inicio: true,
        fim: true,
        cartao_dia: { select: { data: true } },
      },
    });
  }
}
