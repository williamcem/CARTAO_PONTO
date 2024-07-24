/* import { PrismaClient } from "@prisma/client";
import { ResumoModel } from "@domain/models/calcular-resumo";
import { CalcularResumoDia } from "../../../../domain/usecases/calcular-resumo";
import { prisma } from "../../../database/Prisma";
import { arredondarParteDecimal, arredondarParteDecimalHoras } from "./utils";

type MovimentacaoTipo = number | "-";

export class CalcularResumoPostgresRepository implements CalcularResumoDia {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  private calcularResumo(funcionario: any) {
    let somaMovimentacao60 = 0;
    let somaMovimentacao100 = 0;
    let somaMovimentacaoNoturna60 = 0;
    let somaMovimentacaoNoturna100 = 0;
    const saldoAnterior = { sessenta: 0, cem: 0 };
    let horasDiurno60 = 0;
    let horasDiurno100 = 0;
    let horasNoturno60 = 0;
    let horasNoturno100 = 0;

    for (const cartao of funcionario.cartao) {
      for (const cartao_dia of cartao.dias) {
        const resumoDia = cartao_dia.ResumoDia || {
          movimentacao60: 0,
          movimentacao100: 0,
          movimentacaoNoturna60: 0,
          movimentacaoNoturna100: 0,
        };

        // Verifica se todas as movimentações são números antes de incluir no resumo
        if (
          typeof resumoDia.movimentacao60 === "number" &&
          typeof resumoDia.movimentacao100 === "number" &&
          typeof resumoDia.movimentacaoNoturna60 === "number" &&
          typeof resumoDia.movimentacaoNoturna100 === "number"
        ) {
          if (!isNaN(resumoDia.movimentacao60)) somaMovimentacao60 += resumoDia.movimentacao60;
          if (!isNaN(resumoDia.movimentacao100)) somaMovimentacao100 += resumoDia.movimentacao100;
          if (!isNaN(resumoDia.movimentacaoNoturna60)) somaMovimentacaoNoturna60 += resumoDia.movimentacaoNoturna60;
          if (!isNaN(resumoDia.movimentacaoNoturna100)) somaMovimentacaoNoturna100 += resumoDia.movimentacaoNoturna100;
        }
      }
    }

    // Converter movimentacao60 e movimentacao100 em horas diurnas
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

  public async calc(identificacao: string): Promise<ResumoModel> {
    // Procurar o funcionário pelo identificador
    const funcionario = await this.prisma.funcionario.findUnique({
      where: { identificacao },
      include: {
        cartao: {
          include: {
            cartao_dia: {
              orderBy: { id: "asc" },
              include: {
                eventos: true,
                atestado_abonos: true, // Inclui a relação com atestado_abonos
              },
            },
          },
          orderBy: { id: "asc" },
        },
      },
    });

    // Verificar se o funcionário foi encontrado
    if (!funcionario) {
      throw new Error("Funcionário não encontrado");
    }

    // Estrutura para os cartões e dias
    const cartoes = funcionario.cartao.map((cartao) => {
      const dias = cartao.cartao_dia.map((cartao_dia) => {
        // Verificar se há eventos com tipoId 2 ou mais de um do tipo 8 e tratado false
        const eventosCriticos = cartao_dia.eventos.filter((evento) => evento.tipoId === 2 && !evento.tratado);
        const eventosTipo8 = cartao_dia.eventos.filter((evento) => evento.tipoId === 8 && !evento.tratado);

        if (eventosCriticos.length > 0 || eventosTipo8.length > 1) {
          // Se houver eventos críticos ou mais de um evento do tipo 8, não realiza o cálculo deste dia
          return {
            data: cartao_dia.data.toISOString(), // Convertendo Date para string
            cartaoId: cartao_dia.cartaoId,
            periodoDescanso: cartao_dia.periodoDescanso,
            cargaHor: cartao_dia.cargaHor,
            cargaHorariaCompleta: cartao_dia.cargaHorariaCompleta,
            cargaHorariaNoturna: cartao_dia.cargaHorariaNoturna,
            ResumoDia: {
              movimentacao60: "-",
              movimentacao100: "-",
              movimentacaoNoturna60: "-",
              movimentacaoNoturna100: "-",
            },
          };
        }

        const eventosNoturnos = cartao_dia.eventos.filter((evento) => evento.tipoId === 4);
        const eventosDiurnos = cartao_dia.eventos.filter(
          (evento) => evento.tipoId !== 2 && evento.tipoId !== 8 && evento.tipoId !== 4,
        );

        // Somar minutos de atestado_abono
        const minutosAtestadoAbono = cartao_dia.atestado_abonos.reduce((sum, abono) => sum + abono.minutos, 0);

        if (eventosDiurnos.length === 0) {
          // Se não houver eventos diurnos, retornar os dados sem os cálculos
          return {
            data: cartao_dia.data.toISOString(), // Convertendo Date para string
            cartaoId: cartao_dia.cartaoId,
            periodoDescanso: cartao_dia.periodoDescanso,
            cargaHor: cartao_dia.cargaHor,
            cargaHorariaCompleta: cartao_dia.cargaHorariaCompleta,
            cargaHorariaNoturna: cartao_dia.cargaHorariaNoturna,
            ResumoDia: {
              movimentacao60: 0,
              movimentacao100: 0,
              movimentacaoNoturna60: eventosNoturnos.reduce((sum, evento) => sum + evento.minutos, 0),
              movimentacaoNoturna100: 0,
            },
          };
        }

        const totalMinutos = eventosDiurnos.reduce((sum, evento) => sum + evento.minutos, 0) + minutosAtestadoAbono;
        let movimentacao60: MovimentacaoTipo = totalMinutos - cartao_dia.cargaHor;
        let movimentacao100: MovimentacaoTipo = 0;
        let movimentacaoNoturna60 = eventosNoturnos.reduce((sum, evento) => sum + evento.minutos, 0);

        if (movimentacao60 > 120) {
          movimentacao100 = movimentacao60 - 120;
          movimentacao60 = 120;
        }

        return {
          data: cartao_dia.data.toISOString(), // Convertendo Date para string
          cartaoId: cartao_dia.cartaoId,
          periodoDescanso: cartao_dia.periodoDescanso,
          cargaHor: cartao_dia.cargaHor,
          cargaHorariaCompleta: cartao_dia.cargaHorariaCompleta,
          cargaHorariaNoturna: cartao_dia.cargaHorariaNoturna,
          ResumoDia: {
            movimentacao60,
            movimentacao100,
            movimentacaoNoturna60,
            movimentacaoNoturna100: 0, // Aqui pode adicionar a lógica correspondente
          },
        };
      });

      return {
        referencia: cartao.referencia.toISOString(), // Convertendo Date para string
        dias,
      };
    });

    // Calcular o resumo
    let resumoCalculado = this.calcularResumo({ cartao: cartoes });

    // Aplicar a regra adicional
    if (resumoCalculado.movimentacao.sessenta > 0) {
      for (const cartao of cartoes) {
        for (const cartao_dia of cartao.dias) {
          const resumoDia = cartao_dia.ResumoDia;
          if (typeof resumoDia.movimentacao60 === "number" && resumoDia.movimentacao60 < 0) {
            const diferenca = Math.abs(resumoDia.movimentacao60);
            if (resumoCalculado.movimentacao.sessenta >= diferenca) {
              resumoDia.movimentacao60 /= 1.6;
              resumoDia.movimentacao60 = arredondarParteDecimal(resumoDia.movimentacao60);
              resumoCalculado.movimentacao.sessenta -= diferenca;
            } else {
              const restante = diferenca - resumoCalculado.movimentacao.sessenta;
              resumoDia.movimentacao60 = 0;
              resumoCalculado.movimentacao.sessenta = 0;
              if (resumoCalculado.movimentacao.cem >= restante) {
                resumoDia.movimentacao100 -= restante;
                resumoCalculado.movimentacao.cem -= restante;
              } else {
                resumoDia.movimentacao100 -= restante;
                resumoCalculado.movimentacao.cem = 0;
              }
            }
          }
        }
      }
      // Recalcular o resumo após aplicar a regra adicional
      resumoCalculado = this.calcularResumo({ cartao: cartoes });
    }

    // Retornar os dados completos
    return {
      identificacao: funcionario.identificacao,
      cartao: cartoes,
      Resumo: resumoCalculado,
    };
  }
}


    // Aplicar a regra adicional
    if (resumoCalculado.movimentacao.sessenta > 0) {
      console.log("Antes da divisão por 1.6:", JSON.stringify(cartoes, null, 2));
      for (const cartao of cartoes) {
        for (const cartao_dia of cartao.dias) {
          const resumoDia = cartao_dia.ResumoDia;
          if (typeof resumoDia.movimentacao60 === "number" && resumoDia.movimentacao60 < 0) {
            resumoDia.movimentacao60 /= 1.6;
            resumoDia.movimentacao60 = arredondarParteDecimal(resumoDia.movimentacao60);
          }
        }
      }
      console.log("Depois da divisão por 1.6:", JSON.stringify(cartoes, null, 2));
      // Recalcular o resumo após aplicar a regra adicional
      resumoCalculado = this.calcularResumo({ cartao: cartoes });
    } */
