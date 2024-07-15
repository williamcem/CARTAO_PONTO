import { PrismaClient } from "@prisma/client";
import { ListarOcorrencias } from "../../../../data/usecase/listar-ocorrencias/add-listar-ocorrencias";
import { prisma } from "../../../database/Prisma";
import { arredondarParteDecimalHoras } from "../eventos/utils";

export class OcorrenciaPostgresRepository implements ListarOcorrencias {
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

    horasDiurno60 = arredondarParteDecimalHoras(somaMovimentacao60 / 60);
    horasDiurno100 = arredondarParteDecimalHoras(somaMovimentacao100 / 60);
    horasNoturno60 = arredondarParteDecimalHoras(somaMovimentacaoNoturna60 / 60);
    horasNoturno100 = arredondarParteDecimalHoras(somaMovimentacaoNoturna100 / 60);

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
      },
      include: {
        cartao: {
          select: {
            referencia: true,
            cartao_dia: {
              include: {
                eventos: true, // Aqui incluímos todos os eventos
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

    if (!funcionarios) return { funcionarios: [] };

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
}
