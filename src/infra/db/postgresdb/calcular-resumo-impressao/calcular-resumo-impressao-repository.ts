import { PrismaClient } from "@prisma/client";
import moment from "moment";

import { ResumoModel } from "@domain/models/calcular-resumo";

import { CalcularResumoDiaImpressao } from "../../../../domain/usecases/calcular-resumo";
import { prisma } from "../../../database/Prisma";

export class CalcularResumoImpressaoPostgresRepository implements CalcularResumoDiaImpressao {
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

  public async calc(localidade: string): Promise<ResumoModel[]> {
    // Procurar todos os funcionários da localidade
    const funcionarios = await this.prisma.funcionario.findMany({
      where: { localidadeId: localidade },
      include: {
        cartao: {
          include: {
            cartao_dia: {
              orderBy: { id: "asc" },
              include: {
                eventos: true,
                atestado_abonos: true, // Inclui atestado_abono relacionado ao cartaoDiaId
              },
            },
          },
          orderBy: { id: "asc" },
        },
      },
    });

    // Verificar se há funcionários na localidade
    if (!funcionarios || funcionarios.length === 0) {
      throw new Error("Nenhum funcionário encontrado na localidade");
    }

    // Array para armazenar os resumos de todos os funcionários
    const resumos: ResumoModel[] = [];

    // Iterar sobre todos os funcionários
    for (const funcionario of funcionarios) {
      // Estrutura para os cartões e dias
      const cartoes = funcionario.cartao.map((cartao) => {
        // Filtrar dias relevantes
        const diasFiltrados = cartao.cartao_dia.filter((cartao_dia) => {
          if (!cartao_dia) return false;

          // Verificar se há eventos com tipoId 2 ou mais de um do tipo 8 e tratado false
          const eventosCriticos = cartao_dia.eventos.filter((evento) => evento.tipoId === 2 && !evento.tratado);
          const eventosTipo8 = cartao_dia.eventos.filter((evento) => evento.tipoId === 8 && !evento.tratado);

          if (eventosCriticos.length > 0 || eventosTipo8.length > 1) {
            return true;
          }

          const eventosDiurnos = cartao_dia.eventos.filter(
            (evento) => evento.tipoId !== 2 && evento.tipoId !== 8 && evento.tipoId !== 4,
          );

          // Verificar se não há eventos diurnos e nenhum registro em atestado_abono
          return eventosDiurnos.length !== 0 || cartao_dia.atestado_abonos.length !== 0;
        });

        // Mapear dias relevantes
        const dias = diasFiltrados.map((cartao_dia) => {
          // Verificar se há eventos com tipoId 2 ou mais de um do tipo 8 e tratado false
          const eventosCriticos = cartao_dia.eventos.filter((evento) => evento.tipoId === 2 && !evento.tratado);
          const eventosTipo8 = cartao_dia.eventos.filter((evento) => evento.tipoId === 8 && !evento.tratado);

          if (eventosCriticos.length > 0 || eventosTipo8.length > 1) {
            // Se houver eventos críticos ou mais de um evento do tipo 8, retorna movimentações "-"
            return {
              data: cartao_dia.data.toISOString(), // Convertendo Date para string
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

          // Somar minutos dos eventos diurnos e dos atestados/abonos
          const totalMinutos =
            eventosDiurnos.reduce((sum, evento) => sum + evento.minutos, 0) +
            cartao_dia.atestado_abonos.reduce((sum, abono) => sum + abono.minutos, 0);

          let movimentacao60 = totalMinutos - cartao_dia.cargaHor;
          let movimentacao100 = 0;
          let movimentacaoNoturna60 = eventosNoturnos.reduce((sum, evento) => sum + evento.minutos, 0);

          if (movimentacao60 > 120) {
            movimentacao100 = movimentacao60 - 120;
            movimentacao60 = 120;
          }

          return {
            data: cartao_dia.data.toISOString(), // Convertendo Date para string
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

      // Calcular o resumo inicial
      let resumoCalculado = this.calcularResumo({ cartao: cartoes });

      // Aplicar a regra adicional
      let saldoSessenta = resumoCalculado.movimentacao.sessenta;
      const diasDivididos = new Set<string>(); // Set para armazenar dias divididos

      const cartoesAtualizados = cartoes.map((cartao) => {
        const dias = cartao.dias.map((cartao_dia) => {
          const dataFormatada = moment.utc(cartao_dia.data).format("YYYY-MM-DD");
          if (typeof cartao_dia.ResumoDia.movimentacao60 === "number" && cartao_dia.ResumoDia.movimentacao60 < 0) {
            if (saldoSessenta > 0 && !diasDivididos.has(dataFormatada)) {
              const diferenca = Math.abs(cartao_dia.ResumoDia.movimentacao60);
              cartao_dia.ResumoDia.movimentacao60 = Number((cartao_dia.ResumoDia.movimentacao60 / 1.6).toFixed());
              saldoSessenta -= diferenca;
              diasDivididos.add(dataFormatada); // Marca o dia como dividido
            }
          }
          return cartao_dia;
        });
        return { ...cartao, dias };
      });

      // Recalcular o resumo após aplicar a regra adicional
      resumoCalculado = this.calcularResumo({ cartao: cartoesAtualizados });

      // Garantir que os dias divididos permanecem divididos
      cartoesAtualizados.forEach((cartao) => {
        cartao.dias.forEach((cartao_dia) => {
          const dataFormatada = moment.utc(cartao_dia.data).format("YYYY-MM-DD");
          if (diasDivididos.has(dataFormatada)) {
            // Aqui certificamos que não revertam a divisão
            cartao_dia.ResumoDia.movimentacao60 = Number(Number(cartao_dia.ResumoDia.movimentacao60).toFixed());
          }
        });
      });

      // Recalcular o resumo após garantir a persistência das divisões
      resumoCalculado = this.calcularResumo({ cartao: cartoesAtualizados });

      // Adicionar o resumo do funcionário à lista de resumos
      resumos.push({
        identificacao: funcionario.identificacao,
        cartao: cartoesAtualizados,
        Resumo: resumoCalculado,
      });
    }

    // Retornar os resumos de todos os funcionários
    return resumos;
  }
}
