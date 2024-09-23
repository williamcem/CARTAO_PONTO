import { FuncionarioImpressaoCalculoPostgresRepository } from "../../../infra/db/postgresdb/get-funcionario-impressao-calculo/get-funcionario-impressao-calculo";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./procurra-funcionario-impressao-calculoprotocols";
import moment from "moment";
import "moment/locale/pt-br";

interface ResumoDoDiaOutput {
  diurno: { ext1: number | string; ext2: number | string; ext3: number | string };
  noturno: { ext1: number | string; ext2: number | string; ext3: number | string };
}

interface ResumoDoDiaInput {
  dia: {
    id: number;
    cargaHorariaTotal: number;
    eventos: { tipoId: number; minutos: number; tratado: boolean }[];
    abono: { minutos: number };
    contemAusencia: boolean;
  };
  resumoCartao: {
    atual: {
      diurno: {
        ext1: number;
        ext2: number;
        ext3: number;
      };
      noturno: {
        ext1: number;
        ext2: number;
        ext3: number;
      };
    };
  };
}

export class GetFuncionarioImpressaoCalculoController implements Controller {
  constructor(private readonly funcionarioImpressaoCalculoPostgresRepository: FuncionarioImpressaoCalculoPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { cartaoId, localidade, funcionariosId, onlyDay, referencia, showLegacy, showBalance } = httpRequest?.query;

      const onlyDays = Number(onlyDay);

      if (!cartaoId) {
        if (!referencia) return badRequest(new FuncionarioParamError("Falta referência!"));

        if (!moment(referencia).isValid()) return badRequest(new FuncionarioParamError("Referência inválida!"));
      }

      if (!localidade) return badRequest(new FuncionarioParamError("Localidade não fornecido!"));

      let ids: number[] | undefined = undefined;
      const idCartao = cartaoId ? Number(cartaoId) : undefined;
      const referenciaFormatada = referencia ? new Date(referencia) : undefined;

      if (funcionariosId) {
        ids = JSON.parse(funcionariosId);
        if (ids?.length === 0) return badRequest(new FuncionarioParamError("Id's dos funcionários não informado!"));
      }

      const cartoes = await this.funcionarioImpressaoCalculoPostgresRepository.findAllByLocalidade(
        localidade,
        referenciaFormatada,
        idCartao,
        ids,
      );

      // Verifica se nenhum funcionário foi encontrado
      if (!cartoes || cartoes.length === 0) return notFoundRequest({ message: "Nenhum cartão encontrado!", name: "Error" });

      const output = cartoes.map((cartao) => {
        const minutosDiurnos = cartao.cartao_horario_anterior.find((anterior) => anterior.periodoId === 1);
        const minutosNoturnos = cartao.cartao_horario_anterior.find((anterior) => anterior.periodoId === 2);

        const minutosDiurnosPagos = cartao.cartao_horario_pago.find((pago) => pago.periodoId === 1);
        const minutosNoturnosPagos = cartao.cartao_horario_pago.find((pago) => pago.periodoId === 2);

        const minutosDiurnosCompesados = cartao.cartao_horario_compensado.find((pago) => pago.periodoId === 1);
        const minutosNoturnosCompesados = cartao.cartao_horario_compensado.find((pago) => pago.periodoId === 2);

        const resumoCartao = {
          atual: {
            diurno: { ext1: minutosDiurnos?.ext1 || 0, ext2: minutosDiurnos?.ext2 || 0, ext3: minutosDiurnos?.ext3 || 0 },
            noturno: { ext1: minutosNoturnos?.ext1 || 0, ext2: minutosNoturnos?.ext2 || 0, ext3: minutosNoturnos?.ext3 || 0 },
          },
          anterior: {
            diurno: { ext1: minutosDiurnos?.ext1 || 0, ext2: minutosDiurnos?.ext2 || 0, ext3: minutosDiurnos?.ext3 || 0 },
            noturno: { ext1: minutosNoturnos?.ext1 || 0, ext2: minutosNoturnos?.ext2 || 0, ext3: minutosNoturnos?.ext3 || 0 },
          },
          pago: {
            diurno: {
              ext1: minutosDiurnosPagos?.ext1 || 0,
              ext2: minutosDiurnosPagos?.ext2 || 0,
              ext3: minutosDiurnosPagos?.ext3 || 0,
            },
            noturno: {
              ext1: minutosNoturnosPagos?.ext1 || 0,
              ext2: minutosNoturnosPagos?.ext2 || 0,
              ext3: minutosNoturnosPagos?.ext3 || 0,
            },
          },
          compensado: {
            diurno: {
              ext1: minutosDiurnosCompesados?.ext1 || 0,
              ext2: minutosDiurnosCompesados?.ext2 || 0,
              ext3: minutosDiurnosCompesados?.ext3 || 0,
            },
            noturno: {
              ext1: minutosNoturnosCompesados?.ext1 || 0,
              ext2: minutosNoturnosCompesados?.ext2 || 0,
              ext3: minutosNoturnosCompesados?.ext3 || 0,
            },
          },
        };

        const dias = cartao.cartao_dia.map((dia) => {
          const periodos: { entrada: string; saida: string; periodoId: number; validadoPeloOperador: boolean }[] = [];

          let resumoLegado = {
            diurno: "",
            noturno: "",
          };
          let dataFormatada = moment.utc(dia.data).format("DD/MM/YYYY ddd").toUpperCase();

          if (onlyDays) return { data: dia.data, dataFormatada, status: dia.cartao_dia_status, id: dia.id };

          const contemAusencia = dia.eventos.find((evento) => evento.tipoId !== 1);

          if (contemAusencia && dia.cargaHorPrimeiroPeriodo) {
            const existeLancamento = dia.cartao_dia_lancamentos.some((lancamento) => lancamento.periodoId === 1);
            if (!existeLancamento) {
              periodos.push({
                entrada: contemAusencia.tipo_eventos?.nome || "",
                saida: contemAusencia.tipo_eventos?.nome || "",
                periodoId: 1,
                validadoPeloOperador: true,
              });
            }
          }

          if (contemAusencia && dia.cargaHorSegundoPeriodo) {
            const existeLancamento = dia.cartao_dia_lancamentos.some((lancamento) => lancamento.periodoId === 2);
            if (!existeLancamento) {
              periodos.push({
                entrada: contemAusencia.tipo_eventos?.nome || "",
                saida: contemAusencia.tipo_eventos?.nome || "",
                periodoId: 2,
                validadoPeloOperador: true,
              });
            }
          }

          const eventos = dia.eventos.map((evento) => {
            return { minutos: evento.minutos, tipoId: evento.tipoId || 0, tratado: evento.tratado };
          });

          const abono = { minutos: 0 };

          dia.atestado_abonos.map((abonoLocal) => (abono.minutos += abonoLocal.minutos));

          let resumo = this.calcularResumoPorDia({
            dia: { id: dia.id, eventos, abono, cargaHorariaTotal: dia.cargaHor, contemAusencia: Boolean(contemAusencia) },
            resumoCartao,
          });

          const existeEventoIndefinidoNaoTratado = dia.eventos.some((evento) => evento.tipoId === 2 && !evento.tratado);
          const existeDoisIntervalosSemtratamento =
            dia.eventos.filter((evento) => evento.tipoId === 8 && !evento.tratado).length > 1;

          if (showLegacy) {
            if (existeEventoIndefinidoNaoTratado || existeDoisIntervalosSemtratamento) {
              resumoLegado.diurno = `-`;
              resumoLegado.noturno = `-`;
            } else {
              resumoLegado.diurno = `${(typeof resumo.diurno.ext1 === "number" ? resumo.diurno.ext1 : 0) + (typeof resumo.diurno.ext2 === "number" ? resumo.diurno.ext2 : 0)}/${resumo.diurno.ext3}`;
              resumoLegado.noturno = `${(typeof resumo.noturno.ext1 === "number" ? resumo.noturno.ext1 : 0) + (typeof resumo.noturno.ext2 === "number" ? resumo.noturno.ext2 : 0)}/${resumo.noturno.ext3}`;
            }
          }

          if (existeEventoIndefinidoNaoTratado || existeDoisIntervalosSemtratamento) {
            resumo.diurno.ext1 = "-";
            resumo.diurno.ext2 = "-";
            resumo.diurno.ext3 = "-";

            resumo.noturno.ext1 = "-";
            resumo.noturno.ext2 = "-";
            resumo.noturno.ext3 = "-";
          } else {
            if (resumoCartao.atual.diurno.ext1 < 0) {
              const result = this.formatarSaldoDoDia({
                minutos: resumoCartao.atual.diurno.ext1,
                saldo: {
                  diurno: {
                    ext1: Number(resumo.diurno.ext1),
                    ext2: Number(resumo.diurno.ext2),
                    ext3: Number(resumo.diurno.ext3),
                  },
                  noturno: {
                    ext1: Number(resumo.noturno.ext1),
                    ext2: Number(resumo.noturno.ext2),
                    ext3: Number(resumo.noturno.ext3),
                  },
                },
              });
              resumoCartao.atual = result.saldo;
            } else {
              if (typeof resumo.diurno.ext1 === "number") resumoCartao.atual.diurno.ext1 += resumo.diurno.ext1;
              if (typeof resumo.diurno.ext2 === "number") resumoCartao.atual.diurno.ext2 += resumo.diurno.ext2;
              if (typeof resumo.diurno.ext3 === "number") resumoCartao.atual.diurno.ext3 += resumo.diurno.ext3;

              if (typeof resumo.noturno.ext1 === "number") resumoCartao.atual.noturno.ext1 += resumo.noturno.ext1;
              if (typeof resumo.noturno.ext2 === "number") resumoCartao.atual.noturno.ext2 += resumo.noturno.ext2;
              if (typeof resumo.noturno.ext3 === "number") resumoCartao.atual.noturno.ext3 += resumo.noturno.ext3;
            }
          }

          dia.cartao_dia_lancamentos.map((lancamento) => {
            periodos.push({
              entrada: moment.utc(lancamento.entrada).format("HH:mm"),
              saida: moment.utc(lancamento.saida).format("HH:mm"),
              periodoId: lancamento.periodoId,
              validadoPeloOperador: lancamento.validadoPeloOperador,
            });
          });

          var saldoAtual:
            | undefined
            | {
                diurno: {
                  ext1: number;
                  ext2: number;
                  ext3: number;
                };
                noturno: {
                  ext1: number;
                  ext2: number;
                  ext3: number;
                };
              } = undefined;

          if (showBalance)
            saldoAtual = {
              diurno: {
                ext1: resumoCartao.atual.diurno.ext1,
                ext2: resumoCartao.atual.diurno.ext2,
                ext3: resumoCartao.atual.diurno.ext3,
              },
              noturno: {
                ext1: resumoCartao.atual.noturno.ext1,
                ext2: resumoCartao.atual.noturno.ext2,
                ext3: resumoCartao.atual.noturno.ext3,
              },
            };

          const eventosJustificativa: {
            id: number;
            tipoId: number;
            tipo: string;
            minutos: number;
          }[] = [];

          const atestados: { id: number; statusId: number; tipo_status: { nome: string } | null }[] = [];
          dia.eventos.map((evento) => {
            if ((evento.tipoId === 2 && !evento.tratado) || evento.tipoId === 5 || evento.tipoId === 6 || evento.tipoId === 12) {
              if (evento.minutos === 0) return undefined;
              eventosJustificativa.push({
                id: evento.id,
                tipoId: evento.tipoId,
                tipo: evento.tipo_eventos?.nome || "",
                minutos: evento.minutos,
              });
              if (evento.atestado_funcionario) {
                const exist = atestados.some((atestado) => evento.atestado_funcionario?.id === atestado.id);
                if (!exist)
                  atestados.push({
                    ...evento.atestado_funcionario,
                  });
              }
            }
          });

          dia.atestado_abonos.map((abono) => {
            const existAtestado = atestados.some((atestado) => atestado.id === abono.atestado_funcionario.id);

            if (!existAtestado) atestados.push(abono.atestado_funcionario);
          });

          return {
            data: dia.data,
            dataFormatada,
            resumo,
            periodos,
            resumoLegado,
            status: dia.cartao_dia_status,
            id: dia.id,
            saldoAtual,
            atestados,
            eventos: eventosJustificativa,
          };
        });

        if (!onlyDays) {
          return {
            ...{ id: cartao.id },
            ...{
              dias,
              resumo: resumoCartao,
              referencia: cartao.referencia,
              ...{
                id: cartao.funcionario.id,
                identificacao: cartao.funcionario.identificacao,
                localidade: cartao.funcionario.localidade,
                nome: cartao.funcionario.nome,
                turno: cartao.funcionario.turno.nome,
                centroCusto: cartao.funcionario.centro_custo.nome,
                filial: cartao.funcionario.filial,
                cartaoId: cartao.id,
              },
            },
          };
        }

        return {
          ...{ id: cartao.id },
          ...{ dias, referencia: cartao.referencia },
          ...{
            id: cartao.funcionario.id,
            identificacao: cartao.funcionario.identificacao,
            localidade: cartao.funcionario.localidade,
            nome: cartao.funcionario.nome,
            turno: cartao.funcionario.turno.nome,
            centroCusto: cartao.funcionario.centro_custo.nome,
            filial: cartao.funcionario.filial,
            cartaoId: cartao.id,
          },
        };
      });

      // Retorna o(s) funcionário(s) encontrado(s) juntamente com a mensagem e o resumo
      return ok({ data: output });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }

  calcularResumoPorDia(input: ResumoDoDiaInput): ResumoDoDiaOutput {
    let saldoAtual =
      input.resumoCartao.atual.diurno.ext1 +
      input.resumoCartao.atual.diurno.ext2 +
      input.resumoCartao.atual.diurno.ext3 +
      input.resumoCartao.atual.noturno.ext1 +
      input.resumoCartao.atual.noturno.ext2 +
      input.resumoCartao.atual.noturno.ext3;

    let output: ResumoDoDiaOutput = {
      diurno: { ext1: 0, ext2: 0, ext3: 0 },
      noturno: { ext1: 0, ext2: 0, ext3: 0 },
    };

    let minutosDiurnos = 0;
    let minutosNoturnos = 0;
    let existeFaltaNoturna = false;
    let minutosNoturnosAntesJornada = 0;

    input.dia.eventos.filter((evento) => {
      if (
        evento.tipoId !== 8 &&
        evento.tipoId !== 11 &&
        evento.tipoId !== 4 &&
        evento.tipoId !== 2 &&
        evento.tipoId !== 13 &&
        evento.tipoId !== 14
      )
        minutosDiurnos += evento.minutos;
    });

    input.dia.eventos.filter((evento) => {
      if (evento.tipoId === 4) minutosNoturnos += evento.minutos;
    });

    input.dia.eventos.filter((evento) => {
      if (evento.tipoId === 14) minutosNoturnosAntesJornada += evento.minutos;
    });

    existeFaltaNoturna = input.dia.eventos.some((evento) => evento.tipoId === 13);

    if (minutosDiurnos == 0 && minutosNoturnos == 0 && !input.dia.contemAusencia) return output;

    minutosDiurnos = minutosDiurnos - input.dia.cargaHorariaTotal + input.dia.abono.minutos;

    let minutos = this.executarCalculo({
      existeFaltaNoturna,
      minutosDiurnos,
      saldoAtual,
    });

    const somaTodosMinutos = minutos + minutosNoturnos;
    if (somaTodosMinutos > -10 && somaTodosMinutos < 10 && minutosDiurnos > -10 && minutosDiurnos < 10) {
      minutos = 0;
      minutosNoturnos = 0;
      minutosNoturnosAntesJornada = 0;
    }
    if (minutos > 0) {
      let acrescimoNoturnoAntesJornada = 0;
      if (minutosNoturnosAntesJornada > 0) {
        acrescimoNoturnoAntesJornada = minutosNoturnosAntesJornada - Number((minutosNoturnosAntesJornada / 1.14).toFixed());
      }

      const [ext1, ext2, ext3] = this.inserirRegraPorHoraExtra({
        minutos: minutos + acrescimoNoturnoAntesJornada,
        parametros: [60, 60, 9999],
      });
      output.diurno = { ext1, ext2, ext3 };

      if (minutosNoturnos > 0 || minutosNoturnosAntesJornada > 0) {
        let saldoMinutosNoturnoAntesJornada = minutosNoturnosAntesJornada + Number((minutosNoturnos / 1.14).toFixed());

        for (const key in output.diurno) {
          if (output.diurno.hasOwnProperty(key)) {
            if (saldoMinutosNoturnoAntesJornada <= 0) continue;

            if (
              saldoMinutosNoturnoAntesJornada >
              Number(output.diurno[key as keyof { ext1: string | number; ext2: string | number; ext3: string | number }])
            ) {
              saldoMinutosNoturnoAntesJornada =
                saldoMinutosNoturnoAntesJornada -
                Number(output.diurno[key as keyof { ext1: string | number; ext2: string | number; ext3: string | number }]);
              output.diurno[key as keyof { ext1: string | number; ext2: string | number; ext3: string | number }] = 0;
            } else {
              output.diurno[key as keyof { ext1: string | number; ext2: string | number; ext3: string | number }] =
                Number(output.diurno[key as keyof { ext1: string | number; ext2: string | number; ext3: string | number }]) -
                saldoMinutosNoturnoAntesJornada;
              saldoMinutosNoturnoAntesJornada = 0;
            }
          }
        }
      }
    } else if (minutos < 0) {
      let novoMinutos = this.localizarMovimentacaoESaldoDoDia({
        existeFaltaNoturna,
        minutosDiurnos,
        saldoAtual: input.resumoCartao.atual,
      });

      output = novoMinutos;
    }

    if (minutosNoturnos > 0 || minutosNoturnosAntesJornada > 0) {
      //Esquece os minutos noturno seja antes ou depois da jornada
      if (minutos < 0 && (Math.abs(minutos) > minutosNoturnos || Math.abs(minutos) > minutosNoturnosAntesJornada)) {
      } else {
        const minutosNoturnosAntesJornadaSemAcrescimo = minutosNoturnosAntesJornada / 1.14;
        const minutosTotalExtraDiruno = this.somarMinutosExt({ diurno: output.diurno, noturno: { ext1: 0, ext2: 0, ext3: 0 } });

        //houve minutos após carga horaria e houver noturno antes da jornada
        if (minutos > 0 && minutosNoturnosAntesJornadaSemAcrescimo && !minutosTotalExtraDiruno) {
          const [ext1, ext2, ext3] = this.inserirRegraPorHoraExtra({
            minutos: Number((minutos * 1.14).toFixed()),
            parametros: [60, 60, 9999],
            minutosIniciado: [Number(output.diurno.ext1), Number(output.diurno.ext2), Number(output.diurno.ext3)],
          });
          output.noturno = { ext1, ext2, ext3 };
        } else {
          const [ext1, ext2, ext3] = this.inserirRegraPorHoraExtra({
            minutos: minutosNoturnos + minutosNoturnosAntesJornada,
            parametros: [60, 60, 9999],
            minutosIniciado: [Number(output.diurno.ext1), Number(output.diurno.ext2), Number(output.diurno.ext3)],
          });
          output.noturno = { ext1, ext2, ext3 };
        }
      }
    } else if (minutosNoturnos < 0) output.noturno = { ext1: minutosNoturnos, ext2: 0, ext3: 0 };

    return output;
  }

  inserirRegraPorHoraExtra(input: { minutos: number; parametros: number[]; minutosIniciado?: number[] }): number[] {
    const output = input.parametros.map((parametro, index) => {
      const existeMinutosIniciado = input?.minutosIniciado?.find((_, indexIniciado) => index === indexIniciado) || 0;
      parametro = parametro - existeMinutosIniciado;

      let minutos = 0;

      if (input.minutos <= parametro) minutos = input.minutos;
      else minutos = parametro;

      input.minutos = input.minutos - (input.minutos <= parametro ? input.minutos : parametro);

      return minutos;
    });

    return output.map((value) => Number(value));
  }

  protected somarMinutosExt(input: {
    diurno: { ext1: number | string; ext2: number | string; ext3: number | string };
    noturno: { ext1: number | string; ext2: number | string; ext3: number | string };
  }) {
    let minutos = 0;
    for (const periodo in input) {
      if (input.hasOwnProperty(periodo)) {
        for (const key in input[periodo]) {
          if (input[periodo].hasOwnProperty(key) && typeof input[periodo][key] === "number") minutos += input[periodo][key];
        }
      }
    }

    return minutos;
  }

  executarCalculo(input: { saldoAtual: number; minutosDiurnos: number; existeFaltaNoturna: boolean }): number {
    let minutos = 0;
    if (input.minutosDiurnos > 0)
      //Se os minutos for positivo irá manter
      minutos = input.minutosDiurnos;
    else if (input.minutosDiurnos < 0) {
      //Se o Saldo atual for negativo mantem o valor dos minutos
      if (input.saldoAtual < 0) minutos = input.minutosDiurnos;
      else {
        const saldoAtualComPorcentagem = Number((input.saldoAtual * 1.6).toFixed());
        if (saldoAtualComPorcentagem < Math.abs(input.minutosDiurnos)) {
          const saldoDia = saldoAtualComPorcentagem + input.minutosDiurnos;
          minutos = saldoDia + -input.saldoAtual;
        } else {
          //Se os minutos diurno forem negativos e o saldo suprir fazer 1.6
          const saldoDia = saldoAtualComPorcentagem - Math.abs(input.minutosDiurnos);
          if (saldoDia > 0) minutos = Number((input.minutosDiurnos / 1.6).toFixed());
          else minutos = saldoDia;
        }
      }

      if (input.existeFaltaNoturna) minutos = Number((minutos * 1.14).toFixed());
    }

    return minutos;
  }

  localizarMovimentacaoESaldoDoDia(input: {
    saldoAtual: { diurno: { ext1: number; ext2: number; ext3: number }; noturno: { ext1: number; ext2: number; ext3: number } };
    minutosDiurnos: number;
    existeFaltaNoturna: boolean;
  }) {
    let minutosTotaisSaldo = 0;
    let saldoMinutos = input.minutosDiurnos;

    let output = { diurno: { ext1: 0, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } };
    for (const periodo in input.saldoAtual) {
      if (input.saldoAtual.hasOwnProperty(periodo)) {
        for (const key in input.saldoAtual[periodo]) {
          if (input.saldoAtual[periodo].hasOwnProperty(key)) {
            minutosTotaisSaldo += input.saldoAtual[periodo][key];
          }
        }
      }
    }

    if (input.minutosDiurnos > 0)
      //Se os minutos for positivo irá manter
      output.diurno.ext1 = input.minutosDiurnos;
    else if (input.minutosDiurnos < 0) {
      //Se o Saldo atual for negativo mantem o valor dos minutos
      if (minutosTotaisSaldo < 0) output.diurno.ext1 = input.minutosDiurnos;
      else {
        output = this.executarRegraCompensacaoSaldoDiaComExtra({
          minutos: saldoMinutos,
          saldo: input.saldoAtual,
        }).movimentacao;
      }
    }

    return output;
  }

  executarRegraCompensacaoSaldoDiaComExtra(input: {
    saldo: {
      diurno: { ext1: number; ext2: number; ext3: number };
      noturno: { ext1: number; ext2: number; ext3: number };
    };
    minutos: number;
  }) {
    const saldo: typeof input.saldo = {
      diurno: { ext1: input.saldo.diurno.ext1, ext2: input.saldo.diurno.ext2, ext3: input.saldo.diurno.ext3 },
      noturno: { ext1: input.saldo.noturno.ext1, ext2: input.saldo.noturno.ext2, ext3: input.saldo.noturno.ext3 },
    };
    let saldoMinutos = input.minutos;

    let movimentacao = { diurno: { ext1: 0, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } };
    let saldoTotal = 0;

    if (saldoMinutos == 0) return { saldo, movimentacao };

    for (const periodo in input.saldo) {
      if (movimentacao.hasOwnProperty(periodo)) {
        for (const key in input.saldo[periodo]) {
          if (input.saldo[periodo].hasOwnProperty(key)) {
            saldoTotal += Number(input.saldo[periodo][key].toFixed());
          }
        }
      }
    }

    let saldoTotalComPorcentagem = saldoTotal * 1.6;
    const saldoTotalComPorcetagemEMaiorQueMinutosNegativo = Math.abs(saldoTotalComPorcentagem) > Math.abs(saldoMinutos);

    if (saldoTotalComPorcetagemEMaiorQueMinutosNegativo) {
      if (saldoMinutos < 0 && saldoTotal > 0) saldoMinutos = Number((saldoMinutos / 1.6).toFixed());
      while (saldoMinutos !== 0) {
        if (saldo.diurno.ext1) {
          let movimentacaoAtual = saldoMinutos + saldo.diurno.ext1;

          if (movimentacaoAtual < 0) {
            movimentacao.diurno.ext1 = -saldo.diurno.ext1;
          } else movimentacao.diurno.ext1 = saldoMinutos;

          const resultado = this.acharSaldo({ extra: saldo.diurno.ext1, minutos: saldoMinutos });
          saldo.diurno.ext1 = resultado.extra;
          saldoMinutos = resultado.minutos;
          continue;
        }

        if (saldo.diurno.ext2) {
          let movimentacaoAtual = saldoMinutos + saldo.diurno.ext2;

          if (movimentacaoAtual < 0) {
            movimentacao.diurno.ext2 = -saldo.diurno.ext2;
          } else movimentacao.diurno.ext2 = saldoMinutos;

          const resultado = this.acharSaldo({ extra: saldo.diurno.ext2, minutos: saldoMinutos });
          saldo.diurno.ext2 = resultado.extra;
          saldoMinutos = resultado.minutos;
          continue;
        }

        if (saldo.noturno.ext1) {
          let movimentacaoAtual = saldoMinutos + saldo.noturno.ext1;

          if (movimentacaoAtual < 0) {
            movimentacao.noturno.ext1 = -saldo.noturno.ext1;
          } else movimentacao.noturno.ext1 = saldoMinutos;

          const resultado = this.acharSaldo({ extra: saldo.noturno.ext1, minutos: saldoMinutos });
          saldo.noturno.ext1 = resultado.extra;
          saldoMinutos = resultado.minutos;
          continue;
        }

        if (saldo.noturno.ext2) {
          let movimentacaoAtual = saldoMinutos + saldo.noturno.ext2;

          if (movimentacaoAtual < 0) {
            movimentacao.noturno.ext2 = -saldo.noturno.ext2;
          } else movimentacao.noturno.ext2 = saldoMinutos;

          const resultado = this.acharSaldo({ extra: saldo.noturno.ext2, minutos: saldoMinutos });
          saldo.noturno.ext2 = resultado.extra;
          saldoMinutos = resultado.minutos;
          continue;
        }

        if (saldo.diurno.ext3) {
          let movimentacaoAtual = saldoMinutos + saldo.diurno.ext3;

          if (movimentacaoAtual < 0) {
            movimentacao.diurno.ext3 = -saldo.diurno.ext3;
          } else movimentacao.diurno.ext3 = saldoMinutos;

          const resultado = this.acharSaldo({ extra: saldo.diurno.ext3, minutos: saldoMinutos });
          saldo.diurno.ext3 = resultado.extra;
          saldoMinutos = resultado.minutos;
          continue;
        }

        if (saldo.noturno.ext3) {
          let movimentacaoAtual = saldoMinutos + saldo.noturno.ext3;

          if (movimentacaoAtual < 0) {
            movimentacao.noturno.ext3 = -saldo.noturno.ext3;
          } else movimentacao.noturno.ext3 = saldoMinutos;
          const resultado = this.acharSaldo({ extra: saldo.noturno.ext3, minutos: saldoMinutos });

          saldo.noturno.ext3 = resultado.extra;
          saldoMinutos = resultado.minutos;
          continue;
        }

        //O que não suprir voltar fazer por 1.6
        movimentacao.diurno.ext1 = Number((saldoMinutos * 1.6).toFixed());
        saldo.diurno.ext1 = saldoMinutos;
        saldoMinutos = 0;
      }
    } else {
      //Se o saldo total for positivo
      if (saldoTotal > 0) {
        const restoSaldoTotal = saldoTotalComPorcentagem - saldoTotal;
        movimentacao.diurno.ext1 = Number((saldoMinutos + restoSaldoTotal).toFixed());
        saldo.diurno.ext1 = movimentacao.diurno.ext1;
        saldoMinutos = 0;
      } else {
        movimentacao.diurno.ext1 = saldoMinutos;
        saldo.diurno.ext1 = saldoMinutos + saldoTotal;
        saldoMinutos = 0;
      }
    }

    for (const periodo in movimentacao) {
      if (movimentacao.hasOwnProperty(periodo)) {
        for (const key in movimentacao[periodo]) {
          if (movimentacao[periodo].hasOwnProperty(key)) {
            movimentacao[periodo][key] = Number(movimentacao[periodo][key].toFixed());
          }
        }
      }
    }

    return { saldo, movimentacao };
  }

  formatarSaldoDoDia(input: {
    saldo: {
      diurno: { ext1: number; ext2: number; ext3: number };
      noturno: { ext1: number; ext2: number; ext3: number };
    };
    minutos: number;
  }) {
    const saldo: typeof input.saldo = {
      diurno: { ext1: input.saldo.diurno.ext1, ext2: input.saldo.diurno.ext2, ext3: input.saldo.diurno.ext3 },
      noturno: { ext1: input.saldo.noturno.ext1, ext2: input.saldo.noturno.ext2, ext3: input.saldo.noturno.ext3 },
    };
    let saldoMinutos = input.minutos;

    let movimentacao = { diurno: { ext1: 0, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } };

    if (saldoMinutos == 0) return { saldo, movimentacao };

    while (saldoMinutos !== 0) {
      if (saldo.diurno.ext1) {
        let movimentacaoAtual = saldoMinutos + saldo.diurno.ext1;

        if (movimentacaoAtual < 0) {
          movimentacao.diurno.ext1 = -saldo.diurno.ext1;
        } else movimentacao.diurno.ext1 = saldoMinutos;

        const resultado = this.acharSaldo({ extra: saldo.diurno.ext1, minutos: saldoMinutos });
        saldo.diurno.ext1 = resultado.extra;
        saldoMinutos = resultado.minutos;
        continue;
      }

      if (saldo.diurno.ext2) {
        let movimentacaoAtual = saldoMinutos + saldo.diurno.ext2;

        if (movimentacaoAtual < 0) {
          movimentacao.diurno.ext2 = -saldo.diurno.ext2;
        } else movimentacao.diurno.ext2 = saldoMinutos;

        const resultado = this.acharSaldo({ extra: saldo.diurno.ext2, minutos: saldoMinutos });
        saldo.diurno.ext2 = resultado.extra;
        saldoMinutos = resultado.minutos;
        continue;
      }

      if (saldo.noturno.ext1) {
        let movimentacaoAtual = saldoMinutos + saldo.noturno.ext1;

        if (movimentacaoAtual < 0) {
          movimentacao.noturno.ext1 = -saldo.noturno.ext1;
        } else movimentacao.noturno.ext1 = saldoMinutos;

        const resultado = this.acharSaldo({ extra: saldo.noturno.ext1, minutos: saldoMinutos });
        saldo.noturno.ext1 = resultado.extra;
        saldoMinutos = resultado.minutos;
        continue;
      }

      if (saldo.noturno.ext2) {
        let movimentacaoAtual = saldoMinutos + saldo.diurno.ext2;

        if (movimentacaoAtual < 0) {
          movimentacao.noturno.ext2 = -saldo.noturno.ext2;
        } else movimentacao.noturno.ext2 = saldoMinutos;

        const resultado = this.acharSaldo({ extra: saldo.noturno.ext2, minutos: saldoMinutos });
        saldo.noturno.ext2 = resultado.extra;
        saldoMinutos = resultado.minutos;
        continue;
      }

      if (saldo.diurno.ext3) {
        let movimentacaoAtual = saldoMinutos + saldo.diurno.ext3;

        if (movimentacaoAtual < 0) {
          movimentacao.diurno.ext3 = -saldo.diurno.ext3;
        } else movimentacao.diurno.ext3 = saldoMinutos;

        const resultado = this.acharSaldo({ extra: saldo.diurno.ext3, minutos: saldoMinutos });
        saldo.diurno.ext3 = resultado.extra;
        saldoMinutos = resultado.minutos;
        continue;
      }

      if (saldo.noturno.ext3) {
        let movimentacaoAtual = saldoMinutos + saldo.noturno.ext3;

        if (movimentacaoAtual < 0) {
          movimentacao.noturno.ext3 = -saldo.noturno.ext3;
        } else movimentacao.noturno.ext3 = saldoMinutos;
        const resultado = this.acharSaldo({ extra: saldo.noturno.ext3, minutos: saldoMinutos });

        saldo.noturno.ext3 = resultado.extra;
        saldoMinutos = resultado.minutos;
        continue;
      }

      //O que não suprir voltar fazer por 1.6
      movimentacao.diurno.ext1 = Number((saldoMinutos * 1.6).toFixed());
      saldo.diurno.ext1 = saldoMinutos;
      saldoMinutos = 0;
    }

    return { saldo, movimentacao };
  }

  executarRegraCompensacaoComExtra(input: {
    saldo: {
      diurno: { ext1: number; ext2: number; ext3: number };
      noturno: { ext1: number; ext2: number; ext3: number };
    };
    minutos: number;
  }) {
    const saldo: typeof input.saldo = {
      diurno: { ext1: input.saldo.diurno.ext1, ext2: input.saldo.diurno.ext2, ext3: input.saldo.diurno.ext3 },
      noturno: { ext1: input.saldo.noturno.ext1, ext2: input.saldo.noturno.ext2, ext3: input.saldo.noturno.ext3 },
    };
    let saldoMinutos = input.minutos;

    if (saldoMinutos == 0) return saldo;

    while (saldoMinutos !== 0) {
      if (saldo.diurno.ext1) {
        const resultado = this.acharSaldo({ extra: saldo.diurno.ext1, minutos: saldoMinutos });
        saldo.diurno.ext1 = resultado.extra;
        saldoMinutos = resultado.minutos;
        continue;
      }

      if (saldo.diurno.ext2) {
        const resultado = this.acharSaldo({ extra: saldo.diurno.ext2, minutos: saldoMinutos });
        saldo.diurno.ext2 = resultado.extra;
        saldoMinutos = resultado.minutos;
        continue;
      }

      if (saldo.noturno.ext1) {
        const resultado = this.acharSaldo({ extra: saldo.noturno.ext1, minutos: saldoMinutos });
        saldo.noturno.ext1 = resultado.extra;
        saldoMinutos = resultado.minutos;
        continue;
      }

      if (saldo.noturno.ext2) {
        const resultado = this.acharSaldo({ extra: saldo.noturno.ext2, minutos: saldoMinutos });
        saldo.noturno.ext2 = resultado.extra;
        saldoMinutos = resultado.minutos;
        continue;
      }

      if (saldo.diurno.ext3) {
        const resultado = this.acharSaldo({ extra: saldo.diurno.ext3, minutos: saldoMinutos });
        saldo.diurno.ext3 = resultado.extra;
        saldoMinutos = resultado.minutos;
        continue;
      }

      if (saldo.noturno.ext3) {
        const resultado = this.acharSaldo({ extra: saldo.noturno.ext3, minutos: saldoMinutos });
        saldo.noturno.ext3 = resultado.extra;
        saldoMinutos = resultado.minutos;
        continue;
      }

      saldo.diurno.ext1 = saldoMinutos;
      saldoMinutos = 0;
    }

    return saldo;
  }

  protected acharSaldo(input: { minutos: number; extra: number }) {
    let saldoSupri = input.minutos + input.extra;
    if (saldoSupri > 0) {
      input.minutos = 0;
      input.extra = saldoSupri;
    } else {
      input.minutos = saldoSupri;
      input.extra = 0;
    }

    return input;
  }
}
