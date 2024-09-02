import { PrismaClient } from "@prisma/client";
import { prisma } from "../../../database/Prisma";
import { OcorrenciasNull } from "../../../../presentation/errors/Funcionario-param-error";

export class OcorrenciaPostgresRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  private calcularResumo(dias: any[]) {
    let somaMovimentacao60 = 0;
    let somaMovimentacao100 = 0;
    let somaMovimentacaoNoturna60 = 0;
    let somaMovimentacaoNoturna100 = 0;
    const saldoAnterior = { sessenta: 0, cem: 0 };
    let horasDiurno60 = 0;
    let horasDiurno100 = 0;
    let horasNoturno60 = 0;
    let horasNoturno100 = 0;

    for (const dia of dias) {
      const resumoDia = dia.ResumoDia || {
        movimentacao60: 0,
        movimentacao100: 0,
        movimentacaoNoturna60: 0,
        movimentacaoNoturna100: 0,
      };

      if (
        typeof resumoDia.movimentacao60 === "number" &&
        typeof resumoDia.movimentacao100 === "number" &&
        typeof resumoDia.movimentacaoNoturna60 === "number" &&
        typeof resumoDia.movimentacaoNoturna100 === "number"
      ) {
        if (resumoDia.movimentacao60) somaMovimentacao60 += resumoDia.movimentacao60;
        if (resumoDia.movimentacao100) somaMovimentacao100 += resumoDia.movimentacao100;
        if (resumoDia.movimentacaoNoturna60) somaMovimentacaoNoturna60 += resumoDia.movimentacaoNoturna60;
        if (resumoDia.movimentacaoNoturna100) somaMovimentacaoNoturna100 += resumoDia.movimentacaoNoturna100;
      }
    }

    horasDiurno60 = Number((somaMovimentacao60 / 60).toFixed());
    horasDiurno100 = Number((somaMovimentacao100 / 60).toFixed());
    horasNoturno60 = Number((somaMovimentacaoNoturna60 / 60).toFixed());
    horasNoturno100 = Number((somaMovimentacaoNoturna100 / 60).toFixed());

    return {
      movimentacao: {
        sessenta: somaMovimentacao60 + somaMovimentacaoNoturna60,
        cem: somaMovimentacao100 + somaMovimentacaoNoturna100,
      },
      soma: {
        sessenta: saldoAnterior.sessenta + somaMovimentacao60 + somaMovimentacaoNoturna60,
        cem: saldoAnterior.cem + somaMovimentacao100 + somaMovimentacaoNoturna100,
      },
      horas: {
        diurnas: { sessenta: horasDiurno60, cem: horasDiurno100 },
        noturnas: { sessenta: horasNoturno60, cem: horasNoturno100 },
      },
      saldoAnterior: saldoAnterior,
    };
  }

  public async find(identificacao: string, localidade: string, referencia: Date) {
    const funcionarios = await this.prisma.funcionario.findMany({
      where: {
        identificacao: identificacao,
        localidadeId: localidade,
        cartao: {
          some: { cartao_dia: { some: { cartao_dia_lancamentos: { some: { validadoPeloOperador: true } } } } },
        },
      },
      include: {
        cartao: {
          select: {
            referencia: true,
            cartao_dia: {
              include: {
                eventos: {
                  where: { cartao_dia: { cartao_dia_lancamentos: { some: { validadoPeloOperador: true } } } },
                }, // Aqui incluímos todos os eventos
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
          where: { referencia },
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
      funcionarios: funcionarios.map((funcionario) => {
        const diasComEventos = funcionario.cartao.flatMap(
          (cartao) =>
            cartao.cartao_dia
              .map((cartao_dia) => {
                const eventos = cartao_dia.eventos.filter((evento) => {
                  if (evento.tipoId === 2 && !evento.tratado) return true;
                  if (evento.tipoId === 8 && !evento.tratado) {
                    const countTipo8 = cartao_dia.eventos.filter((e) => e.tipoId === 8).length;
                    return countTipo8 > 1;
                  }
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
              .filter((dia) => dia.eventos.length > 0), // Filtra dias sem eventos
        );

        const resumo = this.calcularResumo(diasComEventos);

        return {
          id: funcionario.id,
          identificacao: funcionario.identificacao,
          nome: funcionario.nome,
          turno: funcionario.turno,
          localidade: funcionario.localidade,
          referencia: funcionario.cartao.length > 0 ? funcionario.cartao[0].referencia : null,
          dias: diasComEventos,
          Resumo: resumo,
        };
      }),
    };
  }

  public async findFirstAtestado(input: { data: { gte: Date; lte: Date }; funcionarioId: number; statusId: number }) {
    return await this.prisma.atestado_funcionario.findFirst({
      where: { data: input.data, funcionarioId: input.funcionarioId, statusId: input.statusId },
    });
  }
}
