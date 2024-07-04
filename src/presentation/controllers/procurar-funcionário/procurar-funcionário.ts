import moment from "moment";

import { FuncionarioPostgresRepository } from "../../../infra/db/postgresdb/get-funcionario/get-funcionario";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { calcularAusencias } from "../listar-ocorrencia/calcularAusencias";
import { Controller, HttpRequest, HttpResponse } from "./procurra-funcionario-protocols";
import { arredondarParteDecimal, arredondarParteDecimalHoras, BuscarHorarioNortunoEmMinutos } from "./utils";

export class GetFuncionarioController implements Controller {
  constructor(private readonly funcionarioPostgresRepository: FuncionarioPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { identificacao, localidade, mostraSaldo } = httpRequest?.query;

      if (!identificacao) return badRequest(new FuncionarioParamError("identificacao não fornecido!"));
      if (!localidade) return badRequest(new FuncionarioParamError("localidade não fornecido!"));

      const funcionario = await this.funcionarioPostgresRepository.findFisrt(identificacao, localidade);

      // Verifica se nenhum funcionário foi encontrado
      if (!funcionario) return notFoundRequest({ message: "Identificador não encontrado", name: "Error" });

      // Calcula a diferença total, adiciona a cada cartao_dia, e calcula movimentacoes
      this.adicionarDiferencasEMovimentacoes(funcionario, mostraSaldo);

      // Retorna o(s) funcionário(s) encontrado(s) juntamente com a mensagem e o resumo
      this.calcularResumo(funcionario);
      return ok({ message: "Identificador encontrado com sucesso", data: funcionario });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }

  private adicionarDiferencasEMovimentacoes(funcionario: any, mostraSaldo: boolean): void {
    for (const cartao of funcionario.cartao) {
      for (const cartao_dia of cartao.cartao_dia) {
        cartao_dia.movimentacao60 = 0;
        cartao_dia.movimentacao100 = 0;
        cartao_dia.movimentacaoNoturna60 = 0;
        cartao_dia.movimentacaoNoturna100 = 0;

        let dif_total = 0;
        let noturno = 0;
        const calculoFalta = calcularAusencias({ data: [cartao_dia] });

        let periodo1Status = 0;
        let periodo2Status = 0;
        let diferencaPeriodo1 = 0;
        let diferencaPeriodo2 = 0;

        for (const lancamento of cartao_dia.cartao_dia_lancamentos) {
          if (lancamento.statusId === 1) {
            dif_total += moment(lancamento.saida).diff(lancamento.entrada, "minutes");
            noturno += BuscarHorarioNortunoEmMinutos(
              moment(cartao_dia.data),
              moment(lancamento.entrada),
              moment(lancamento.saida),
            );

            if (!noturno) cartao_dia.movimentacaoNoturna60 = arredondarParteDecimal(-cartao_dia.cargaHorariaNoturna * 1.14);
          }

          if (lancamento.periodoId === 1) periodo1Status = lancamento.statusId;
          if (lancamento.periodoId === 2) periodo2Status = lancamento.statusId;

          if (lancamento.statusId === 2 || lancamento.statusId === 4) {
            if (lancamento.periodoId === 1) {
              cartao_dia.movimentacao60 = 0;
              dif_total += cartao_dia.cargaHorPrimeiroPeriodo;
            } else if (lancamento.periodoId === 2) {
              cartao_dia.movimentacao60 = 0;
              dif_total += cartao_dia.cargaHorSegundoPeriodo;
            }
          }

          if (lancamento.statusId === 3) {
            if (lancamento.periodoId === 1 && calculoFalta.data[0].funcionarioInfo.ausenciaPeriodo1) {
              diferencaPeriodo1 = calculoFalta.data[0].funcionarioInfo.ausenciaPeriodo1.diferenca;
            } else if (lancamento.periodoId === 2 && calculoFalta.data[0].funcionarioInfo.ausenciaPeriodo2) {
              diferencaPeriodo2 = calculoFalta.data[0].funcionarioInfo.ausenciaPeriodo2.diferenca;
            }
          }
        }

        // Lógica para determinar movimentacao60
        if (periodo1Status === 3 && periodo2Status === 3) {
          cartao_dia.movimentacao60 = diferencaPeriodo1 + diferencaPeriodo2;
        } else if (periodo1Status === 3) {
          cartao_dia.movimentacao60 = diferencaPeriodo1;
        } else if (periodo2Status === 3) {
          cartao_dia.movimentacao60 = diferencaPeriodo2;
        } else {
          const ausenciaPeriodo1 = calculoFalta.data[0].funcionarioInfo.ausenciaPeriodo1;
          const ausenciaPeriodo2 = calculoFalta.data[0].funcionarioInfo.ausenciaPeriodo2;

          if (ausenciaPeriodo1 && !cartao_dia.cartao_dia_lancamentos.some((l: any) => l.periodoId === 1)) {
            cartao_dia.movimentacao60 = ausenciaPeriodo1.diferenca;
          }

          if (ausenciaPeriodo2 && !cartao_dia.cartao_dia_lancamentos.some((l: any) => l.periodoId === 2)) {
            cartao_dia.movimentacao60 = ausenciaPeriodo2.diferenca;
          }

          if (dif_total) cartao_dia.movimentacao60 = dif_total - cartao_dia.cargaHor;
          cartao_dia.movimentacao60 += cartao_dia.cargaHorariaNoturna;

          // Ajustar movimentacao60 para 0 se estiver dentro do intervalo -10 e 10
          if (cartao_dia.movimentacao60 >= -10 && cartao_dia.movimentacao60 <= 10 && noturno < 0) {
            cartao_dia.movimentacao60 = 0;
          }

          // Calcula movimentacao100 se movimentacao60 for maior que 120
          if (cartao_dia.movimentacao60 > 120) {
            cartao_dia.movimentacao100 = cartao_dia.movimentacao60 - 120;
            cartao_dia.movimentacao60 = 120;
          }

          // Verifica se há necessidade de ajuste negativo dividindo por 1,6
          const prevCartaoDiaIndex = cartao.cartao_dia.indexOf(cartao_dia) - 1;
          if (prevCartaoDiaIndex >= 0) {
            const prevCartaoDia = cartao.cartao_dia[prevCartaoDiaIndex];
            if (
              (prevCartaoDia.movimentacao60 > 0 || (prevCartaoDia.movimentacao100 && prevCartaoDia.movimentacao100 > 0)) &&
              (cartao_dia.movimentacao60 < 0 || (cartao_dia.movimentacao100 && cartao_dia.movimentacao100 < 0))
            ) {
              cartao_dia.movimentacao60 /= 1.6;
              if (cartao_dia.movimentacao100 && cartao_dia.movimentacao100 < 0) {
                cartao_dia.movimentacao100 /= 1.6;
              }
            }
          }

          // Arredonda o valor de movimentacao60 e movimentacao100
          cartao_dia.movimentacao60 = arredondarParteDecimal(cartao_dia.movimentacao60);
          if (cartao_dia.movimentacao100) {
            cartao_dia.movimentacao100 = arredondarParteDecimal(cartao_dia.movimentacao100);
          }

          // Se houver noturno
          if (noturno) {
            if (noturno < cartao_dia.cargaHorariaNoturna) {
              noturno -= cartao_dia.cargaHorariaNoturna;
              cartao_dia.movimentacao60 -= noturno;
              if (cartao_dia.movimentacao60 >= -184 && cartao_dia.movimentacao60 <= 184) cartao_dia.movimentacao60 = 0;
              if (cartao_dia.movimentacao60 <= -184 && cartao_dia.movimentacao60 >= 184) cartao_dia.movimentacao60 -= noturno;
            }

            cartao_dia.movimentacaoNoturna60 = arredondarParteDecimal(noturno * 1.14);

            if (noturno < cartao_dia.movimentacao60 && noturno < cartao_dia.cargaHorariaNoturna) {
              cartao_dia.movimentacao60 = dif_total + -noturno - cartao_dia.cargaHor;
            }

            if (noturno === cartao_dia.cargaHorariaNoturna) {
              cartao_dia.movimentacao60 -= noturno;
              cartao_dia.movimentacaoNoturna60 = 0;
              cartao_dia.movimentacaoNoturna100 = 0;
              if (cartao_dia.movimentacao60 >= -10 && cartao_dia.movimentacao60) cartao_dia.movimentacao60 = 0;
            }

            if (noturno > cartao_dia.cargaHorariaNoturna) {
              noturno = arredondarParteDecimal((noturno - cartao_dia.cargaHorariaNoturna) * 1.14);
              cartao_dia.movimentacaoNoturna60 = noturno;

              if (dif_total >= 600) {
                noturno = 360;
                cartao_dia.movimentacao100 = dif_total - (cartao_dia.cargaHor - cartao_dia.cargaHorariaNoturna + noturno);
                cartao_dia.movimentacao60 = 0;
              }
              if (dif_total <= 600) {
                if (dif_total - cartao_dia.cargaHor > 0) {
                  cartao_dia.movimentacao60 = 0;
                  cartao_dia.movimentacao100 = 0;
                } else {
                  cartao_dia.movimentacao60 = dif_total - 600;
                  cartao_dia.movimentacao100 = 0;
                }
              }
            }

            // Verificar e ajustar se movimentacaoNoturna60 excede 120
            if (cartao_dia.movimentacaoNoturna60 > 120) {
              cartao_dia.movimentacaoNoturna100 = cartao_dia.movimentacaoNoturna60 - 120;
              cartao_dia.movimentacaoNoturna60 = 120;
            }
          }
        }

        let status = 0;

        for (const a of cartao_dia.cartao_dia_lancamentos) {
          status = a.statusId;
        }

        // Ajuste final: se movimentacao60 for negativa, define como "-"
        if (!mostraSaldo && cartao_dia.movimentacao60 < 0 && status === 1) {
          cartao_dia.movimentacao60 = "-";
        }
      }
    }
  }

  private calcularResumo(funcionario: any) {
    let somaMovimentacao60 = 0;
    let somaMovimentacao100 = 0;
    let somaMovimentacaoNoturna60 = 0;
    let somaMovimentacaoNoturna100 = 0;
    const saldoAnterior = { "60": 0, "100": 0 };
    let horasDiurno60 = 0;
    let horasDiurno100 = 0;
    let horasNoturno60 = 0;
    let horasNoturno100 = 0;

    for (const cartao of funcionario.cartao) {
      for (const cartao_dia of cartao.cartao_dia) {
        // Verifica se todas as movimentações são números antes de incluir no resumo
        if (
          typeof cartao_dia.movimentacao60 === "number" &&
          typeof cartao_dia.movimentacao100 === "number" &&
          typeof cartao_dia.movimentacaoNoturna60 === "number" &&
          typeof cartao_dia.movimentacaoNoturna100 === "number"
        ) {
          if (cartao_dia.movimentacao60) somaMovimentacao60 += cartao_dia.movimentacao60;
          if (cartao_dia.movimentacao100) somaMovimentacao100 += cartao_dia.movimentacao100;
          if (cartao_dia.movimentacaoNoturna60) somaMovimentacaoNoturna60 += cartao_dia.movimentacaoNoturna60;
          if (cartao_dia.movimentacaoNoturna100) somaMovimentacaoNoturna100 += cartao_dia.movimentacaoNoturna100;
        }
      }
      // Converter movimentacao60 e movimentacao100 em horas diurnas
      horasDiurno60 = arredondarParteDecimalHoras(somaMovimentacao60 / 60);
      horasDiurno100 = arredondarParteDecimalHoras(somaMovimentacao100 / 60);

      horasNoturno60 = arredondarParteDecimalHoras(somaMovimentacaoNoturna60 / 60);
      horasNoturno100 = arredondarParteDecimalHoras(somaMovimentacaoNoturna100 / 60);

      cartao.resumo = {
        movimentacao: {
          60: somaMovimentacao60 + somaMovimentacaoNoturna60,
          100: somaMovimentacao100 + somaMovimentacaoNoturna100,
        },
        soma: {
          60: saldoAnterior["60"] + somaMovimentacao60 + somaMovimentacaoNoturna60,
          100: saldoAnterior["100"] + somaMovimentacao100 + somaMovimentacaoNoturna100,
        },
        horas: {
          diurno: { 60: horasDiurno60, 100: horasDiurno100 },
          noturno: { 60: horasNoturno60, 100: horasNoturno100 },
        },
        saldoAnterior,
      };
    }
  }
}
