import moment, { Moment } from "moment";

import { FuncionarioPostgresRepository } from "../../../infra/db/postgresdb/get-funcionario/get-funcionario";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./procurra-funcionario-protocols";

export class GetFuncionarioController implements Controller {
  constructor(private readonly funcionarioPostgresRepository: FuncionarioPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { identificacao, localidade } = httpRequest?.query;

      if (!identificacao) return badRequest(new FuncionarioParamError("identificacao não fornecido!"));
      if (!localidade) return badRequest(new FuncionarioParamError("localidade não fornecido!"));

      const funcionario = await this.funcionarioPostgresRepository.findFisrt(identificacao, localidade);

      // Verifica se nenhum funcionário foi encontrado
      if (!funcionario) return notFoundRequest({ message: "Identificador não encontrado", name: "Error" });

      // Processa os cartões do funcionário
      const cartao = funcionario.cartao[0];

      for (const cartaoDia of cartao.cartao_dia) {
        let totalMinutosPeriodo1 = { Diurno: 0, Noturno: 0 };
        let totalMinutosPeriodo2 = { Diurno: 0, Noturno: 0 };
        let totalMinutosPeriodo3 = { Diurno: 0, Noturno: 0 };

        let minutosIntervalo1com2 = { Diurno: 0, Noturno: 0 };
        let minutosIntervalo2com3 = { Diurno: 0, Noturno: 0 };

        let minutosEntrada = { Diurno: 0, Noturno: 0 };
        let minutosSaida = { Diurno: 0, Noturno: 0 };

        const lancamentosPeriodo1 = [];
        const lancamentosPeriodo2 = [];
        const lancamentosPeriodo3 = [];

        for (const lancamento of cartaoDia.cartao_dia_lancamentos) {
          const entrada = moment(lancamento.entrada);
          const saida = moment(lancamento.saida);

          const { minutosDiurno, minutosNoturno } = calcularMinutosDiurnoENoturno(moment(cartaoDia.data), entrada, saida);

          if (lancamento.periodoId === 1) {
            totalMinutosPeriodo1.Diurno += minutosDiurno;
            totalMinutosPeriodo1.Noturno += minutosNoturno;
            lancamentosPeriodo1.push(lancamento);
          } else if (lancamento.periodoId === 2) {
            totalMinutosPeriodo2.Diurno += minutosDiurno;
            totalMinutosPeriodo2.Noturno += minutosNoturno;
            lancamentosPeriodo2.push(lancamento);
          } else if (lancamento.periodoId === 3) {
            totalMinutosPeriodo3.Diurno += minutosDiurno;
            totalMinutosPeriodo3.Noturno += minutosNoturno;
            lancamentosPeriodo3.push(lancamento);
          }
        }

        // Calcular diferença de intervalos
        if (lancamentosPeriodo1.length > 0 && lancamentosPeriodo2.length > 0) {
          const ultimaSaidaPeriodo1 = moment(lancamentosPeriodo1[lancamentosPeriodo1.length - 1].saida);
          const primeiraEntradaPeriodo2 = moment(lancamentosPeriodo2[0].entrada);
          const { minutosDiurno, minutosNoturno } = calcularMinutosDiurnoENoturno(
            moment(cartaoDia.data),
            ultimaSaidaPeriodo1,
            primeiraEntradaPeriodo2,
          );

          minutosIntervalo1com2.Diurno = -minutosDiurno;
          minutosIntervalo1com2.Noturno = -minutosNoturno;
        }

        if (lancamentosPeriodo2.length > 0 && lancamentosPeriodo3.length > 0) {
          const ultimaSaidaPeriodo2 = moment(lancamentosPeriodo2[lancamentosPeriodo2.length - 1].saida);
          const primeiraEntradaPeriodo3 = moment(lancamentosPeriodo3[0].entrada);
          const { minutosDiurno, minutosNoturno } = calcularMinutosDiurnoENoturno(
            moment(cartaoDia.data),
            ultimaSaidaPeriodo2,
            primeiraEntradaPeriodo3,
          );

          minutosIntervalo2com3.Diurno = -minutosDiurno;
          minutosIntervalo2com3.Noturno = -minutosNoturno;
        }

        // Extrair horários de entrada e saída esperados
        const cargaHorariaCompletaArray = cartaoDia.cargaHorariaCompleta.split(";");

        const horarioEntradaEsperado = moment(cartaoDia.data)
          .set({
            date: moment(cartaoDia.data).utc(false).date(),
            months: moment(cartaoDia.data).utc(false).month(),
            years: moment(cartaoDia.data).utc(false).year(),
            hours: Number(cargaHorariaCompletaArray[0].split(".")[0]),
            minutes: Number(cargaHorariaCompletaArray[0].split(".")[1]),
          })
          .add(-3, "hours");

        let horarioSaidaEsperado = undefined;
        if (
          cargaHorariaCompletaArray[cargaHorariaCompletaArray.length - 2] !==
          cargaHorariaCompletaArray[cargaHorariaCompletaArray.length - 3]
        ) {
          horarioSaidaEsperado = moment(cartaoDia.data)
            .set({
              date: moment(cartaoDia.data).utc(false).date(),
              months: moment(cartaoDia.data).utc(false).month(),
              years: moment(cartaoDia.data).utc(false).year(),
              hours: Number(cargaHorariaCompletaArray[cargaHorariaCompletaArray.length - 2].split(".")[0]),
              minutes: Number(cargaHorariaCompletaArray[cargaHorariaCompletaArray.length - 2].split(".")[1]),
            })
            .add(-3, "hours");
        } else {
          horarioSaidaEsperado = moment(cartaoDia.data)
            .set({
              date: moment(cartaoDia.data).utc(false).date(),
              months: moment(cartaoDia.data).utc(false).month(),
              years: moment(cartaoDia.data).utc(false).year(),
              hours: Number(cargaHorariaCompletaArray[cargaHorariaCompletaArray.length - 4].split(".")[0]),
              minutes: Number(cargaHorariaCompletaArray[cargaHorariaCompletaArray.length - 4].split(".")[1]),
            })
            .add(-3, "hours");
        }

        if (moment(horarioEntradaEsperado).isAfter(horarioSaidaEsperado)) horarioSaidaEsperado.add(1, "d");

        // Calcular total de minutos do período 1 com base na entrada esperada e a saída real
        if (lancamentosPeriodo1.length > 0) {
          const horarioSaidaRealPeriodo1 = moment(lancamentosPeriodo1[lancamentosPeriodo1.length - 1].saida);
          const { minutosDiurno, minutosNoturno } = calcularMinutosDiurnoENoturno(
            moment(cartaoDia.data),
            horarioEntradaEsperado,
            horarioSaidaRealPeriodo1,
          );
          totalMinutosPeriodo1.Diurno = minutosDiurno;
          totalMinutosPeriodo1.Noturno = minutosNoturno;
        }

        // Calcular total de minutos do período 2 com base na entrada esperada e a saída real
        if (lancamentosPeriodo2.length > 0) {
          const horarioEntradaEsperadoPeriodo2 = moment(lancamentosPeriodo2[0].entrada);
          let horarioSaidaRealPeriodo2;
          if (lancamentosPeriodo3.length > 0) {
            horarioSaidaRealPeriodo2 = moment(lancamentosPeriodo3[0].entrada);
          } else {
            horarioSaidaRealPeriodo2 = moment(lancamentosPeriodo2[lancamentosPeriodo2.length - 1].saida);
          }
          const { minutosDiurno, minutosNoturno } = calcularMinutosDiurnoENoturno(
            moment(cartaoDia.data),
            horarioEntradaEsperadoPeriodo2,
            horarioSaidaRealPeriodo2,
          );
          totalMinutosPeriodo2.Diurno = minutosDiurno;
          totalMinutosPeriodo2.Noturno = minutosNoturno;
        }

        // Calcular diferença de minutos para entrada (comparando apenas horas e minutos)
        if (lancamentosPeriodo1.length > 0) {
          // Entrada
          {
            const horarioEntradaReal = moment(lancamentosPeriodo1[0].entrada).utc();
            const horarioEntradaEsperadoFormatted = horarioEntradaEsperado;
            const diferencaEntrada = moment(horarioEntradaEsperadoFormatted).diff(moment(horarioEntradaReal), "minutes");

            const { minutosDiurno, minutosNoturno } = calcularMinutosDiurnoENoturno(
              moment(cartaoDia.data),
              moment(horarioEntradaEsperadoFormatted),
              moment(horarioEntradaReal),
            );

            if (diferencaEntrada < 0) {
              minutosEntrada.Diurno = -Math.abs(minutosDiurno);
              minutosEntrada.Noturno = -Math.abs(minutosNoturno);
            } else {
              minutosEntrada.Diurno = -minutosDiurno;
              minutosEntrada.Noturno = -minutosNoturno;
            }
          }
          // Saída
          {
            const horarioSaidaReal = moment(lancamentosPeriodo1[0].saida).utc();
            const horarioSaidaEsperadoFormatted = horarioSaidaEsperado;
            const diferencaEntrada = moment(horarioSaidaEsperadoFormatted).diff(moment(horarioSaidaReal), "minutes");

            const { minutosDiurno, minutosNoturno } = calcularMinutosDiurnoENoturno(
              moment(cartaoDia.data),
              moment(horarioSaidaEsperadoFormatted),
              moment(horarioSaidaReal),
            );

            if (diferencaEntrada < 0) {
              minutosSaida.Diurno = Math.abs(minutosDiurno);
              minutosSaida.Noturno = Math.abs(minutosNoturno);
            } else {
              minutosSaida.Diurno = minutosDiurno;
              minutosSaida.Noturno = minutosNoturno;
            }
          }
        }

        // Calcular diferença de minutos para saída (comparando apenas horas e minutos)
        if (lancamentosPeriodo2.length > 0) {
          const horarioEntradaEsperadoPeriodo2 = moment(lancamentosPeriodo2[0].entrada);
          let horarioSaidaRealPeriodo2;
          if (lancamentosPeriodo3.length > 0) {
            horarioSaidaRealPeriodo2 = moment(lancamentosPeriodo3[0].entrada);
          } else {
            horarioSaidaRealPeriodo2 = moment(lancamentosPeriodo2[lancamentosPeriodo2.length - 1].saida);
          }
          const { minutosDiurno, minutosNoturno } = calcularMinutosDiurnoENoturno(
            moment(cartaoDia.data),
            horarioEntradaEsperadoPeriodo2,
            horarioSaidaRealPeriodo2,
          );
          totalMinutosPeriodo2.Diurno = minutosDiurno;
          totalMinutosPeriodo2.Noturno = minutosNoturno;
        }

        if (lancamentosPeriodo1.length > 0) {
          const horarioEntradaReal = moment(lancamentosPeriodo1[0].entrada).utc();
          const horarioEntradaEsperadoFormatted = horarioEntradaEsperado;
          const diferencaEntrada = moment(horarioEntradaEsperadoFormatted).diff(moment(horarioEntradaReal), "minutes");

          const { minutosDiurno, minutosNoturno } = calcularMinutosDiurnoENoturno(
            moment(cartaoDia.data),
            moment(horarioEntradaEsperadoFormatted),
            moment(horarioEntradaReal),
          );

          if (diferencaEntrada < 0) {
            minutosEntrada.Diurno = -Math.abs(minutosDiurno);
            minutosEntrada.Noturno = -Math.abs(minutosNoturno);
          } else {
            minutosEntrada.Diurno = -minutosDiurno;
            minutosEntrada.Noturno = -minutosNoturno;
          }

          const horarioSaidaReal = moment(lancamentosPeriodo1[lancamentosPeriodo1.length - 1].saida).utc();
          const horarioSaidaEsperadoFormatted = horarioSaidaEsperado;
          const diferencaSaida = moment(horarioSaidaEsperadoFormatted).diff(moment(horarioSaidaReal), "minutes");

          const { minutosDiurno: minutosDiurnoSaida, minutosNoturno: minutosNoturnoSaida } = calcularMinutosDiurnoENoturno(
            moment(cartaoDia.data),
            moment(horarioSaidaEsperadoFormatted),
            moment(horarioSaidaReal),
          );

          if (diferencaSaida < 0) {
            minutosSaida.Diurno = Math.abs(minutosDiurnoSaida);
            minutosSaida.Noturno = Math.abs(minutosNoturnoSaida);
          } else {
            minutosSaida.Diurno = minutosDiurnoSaida;
            minutosSaida.Noturno = minutosNoturnoSaida;
          }
        }

        if (lancamentosPeriodo2.length > 0) {
          const horarioSaidaReal = moment(lancamentosPeriodo2[lancamentosPeriodo2.length - 1].saida).utc();
          const horarioSaidaEsperadoFormatted = horarioSaidaEsperado;
          const diferencaSaida = moment(horarioSaidaEsperadoFormatted).diff(moment(horarioSaidaReal), "minutes");

          const { minutosDiurno: minutosDiurnoSaida, minutosNoturno: minutosNoturnoSaida } = calcularMinutosDiurnoENoturno(
            moment(cartaoDia.data),
            moment(horarioSaidaEsperadoFormatted),
            moment(horarioSaidaReal),
          );

          if (diferencaSaida < 0) {
            minutosSaida.Diurno = Math.abs(minutosDiurnoSaida);
            minutosSaida.Noturno = Math.abs(minutosNoturnoSaida);
          } else {
            minutosSaida.Diurno = minutosDiurnoSaida;
            minutosSaida.Noturno = minutosNoturnoSaida;
          }
        } else if (lancamentosPeriodo3.length > 0) {
          const horarioSaidaReal = moment(lancamentosPeriodo3[lancamentosPeriodo3.length - 1].saida).utc();
          const horarioSaidaEsperadoFormatted = horarioSaidaEsperado;
          const diferencaSaida = moment(horarioSaidaEsperadoFormatted).diff(moment(horarioSaidaReal), "minutes");

          const { minutosDiurno: minutosDiurnoSaida, minutosNoturno: minutosNoturnoSaida } = calcularMinutosDiurnoENoturno(
            moment(cartaoDia.data),
            moment(horarioSaidaEsperadoFormatted),
            moment(horarioSaidaReal),
          );

          if (diferencaSaida < 0) {
            minutosSaida.Diurno = Math.abs(minutosDiurnoSaida);
            minutosSaida.Noturno = Math.abs(minutosNoturnoSaida);
          } else {
            minutosSaida.Diurno = minutosDiurnoSaida;
            minutosSaida.Noturno = minutosNoturnoSaida;
          }
        }

        // Adiciona os totais de minutos ao objeto cartao_dia dentro do objeto minutos_entradas_saidas
        cartaoDia.minutos_entradas_saidas = {
          minutosEntrada,
          totalMinutosPeriodo1,
          minutosIntervalo1com2,
          totalMinutosPeriodo2,
          minutosIntervalo2com3,
          totalMinutosPeriodo3,
          minutosSaida,
        };
      }

      // Retorna o(s) funcionário(s) encontrado(s) juntamente com a mensagem e os dados do cartão de ponto
      return ok({
        message: "Identificador encontrado com sucesso",
        data: funcionario,
      });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}

function calcularMinutosDiurnoENoturno(data: Moment, inicio: Moment, fim: Moment, totalMinutosPeriodo2?: any) {
  const horarioNoturnoInicio = moment(data).utc().hour(22);
  const horarioNoturnoFim = moment(data).utc().add(1, "day").set({ hour: 5, minute: 0, second: 0 });

  let minutosDiurno = 0;
  let minutosNoturno = 0;

  if (inicio.isBetween(horarioNoturnoInicio, horarioNoturnoFim) || inicio.isSame(horarioNoturnoInicio)) {
    if (fim.isBefore(horarioNoturnoFim)) {
      minutosNoturno = fim.diff(inicio, "minutes");
    } else {
      minutosNoturno = horarioNoturnoFim.diff(inicio, "minutes");
      minutosDiurno = fim.diff(horarioNoturnoFim, "minutes");
    }
  } else if (fim.isBetween(horarioNoturnoInicio, horarioNoturnoFim) || fim.isSame(horarioNoturnoInicio)) {
    if (inicio.isBefore(fim)) {
      minutosDiurno = horarioNoturnoInicio.diff(inicio, "minutes");
      minutosNoturno = fim.diff(horarioNoturnoInicio, "minutes");
    } else {
      minutosDiurno = horarioNoturnoFim.diff(inicio, "minutes");
      minutosNoturno = fim.diff(horarioNoturnoFim, "minutes");
    }
  } else {
    if (fim > horarioNoturnoFim.utc().add(-1, "days") && totalMinutosPeriodo2) {
      minutosNoturno -= inicio.diff(horarioNoturnoFim, "minutes");
      minutosDiurno = fim.diff(horarioNoturnoFim, "minutes");
      minutosNoturno = fim.diff(inicio, "minutes");
    } else minutosDiurno = fim.diff(inicio, "minutes");

  }

  return { minutosDiurno, minutosNoturno };
}
