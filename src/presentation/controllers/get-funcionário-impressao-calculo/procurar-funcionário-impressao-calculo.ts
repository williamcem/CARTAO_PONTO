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

        const resumoCartao = {
          atual: {
            diurno: { ext1: minutosDiurnos?.ext1 || 0, ext2: minutosDiurnos?.ext2 || 0, ext3: minutosDiurnos?.ext3 || 0 },
            noturno: { ext1: minutosNoturnos?.ext1 || 0, ext2: minutosNoturnos?.ext2 || 0, ext3: minutosNoturnos?.ext3 || 0 },
          },
          anterior: {
            diurno: { ext1: minutosDiurnos?.ext1 || 0, ext2: minutosDiurnos?.ext2 || 0, ext3: minutosDiurnos?.ext3 || 0 },
            noturno: { ext1: minutosNoturnos?.ext1 || 0, ext2: minutosNoturnos?.ext2 || 0, ext3: minutosNoturnos?.ext3 || 0 },
          },
        };

        const dias = cartao.cartao_dia.map((dia) => {
          let dataFormatada = moment.utc(dia.data).format("DD/MM/YYYY ddd").toUpperCase();

          if (onlyDays) return { data: dia.data, dataFormatada, status: dia.cartao_dia_status, id: dia.id };

          let resumoLegado = {
            diurno: "",
            noturno: "",
          };

          const contemAusencia = dia.eventos.some((evento) => evento.tipoId === 2);

          const eventos = dia.eventos.map((evento) => {
            return { minutos: evento.minutos, tipoId: evento.tipoId || 0, tratado: evento.tratado };
          });

          const abono = { minutos: 0 };

          dia.atestado_abonos.map((abonoLocal) => (abono.minutos += abonoLocal.minutos));

          let resumo = this.calcularResumoPorDia({
            dia: { id: dia.id, eventos, abono, cargaHorariaTotal: dia.cargaHor, contemAusencia },
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
            if (typeof resumo.diurno.ext1 === "number") resumoCartao.atual.diurno.ext1 += resumo.diurno.ext1;
            if (typeof resumo.diurno.ext2 === "number") resumoCartao.atual.diurno.ext2 += resumo.diurno.ext2;
            if (typeof resumo.diurno.ext3 === "number") resumoCartao.atual.diurno.ext3 += resumo.diurno.ext3;

            if (typeof resumo.noturno.ext1 === "number") resumoCartao.atual.noturno.ext1 += resumo.noturno.ext1;
            if (typeof resumo.noturno.ext2 === "number") resumoCartao.atual.noturno.ext2 += resumo.noturno.ext2;
            if (typeof resumo.noturno.ext3 === "number") resumoCartao.atual.noturno.ext3 += resumo.noturno.ext3;
          }
          const periodos: { entrada: string; saida: string; periodoId: number; validadoPeloOperador: boolean }[] = [];

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

          return {
            data: dia.data,
            dataFormatada,
            resumo,
            periodos,
            resumoLegado,
            contemAusencia,
            status: dia.cartao_dia_status,
            id: dia.id,
            saldoAtual,
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

    const output: ResumoDoDiaOutput = {
      diurno: { ext1: 0, ext2: 0, ext3: 0 },
      noturno: { ext1: 0, ext2: 0, ext3: 0 },
    };

    if (!input.dia.cargaHorariaTotal) return output;

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

    const somaTodosMinutos = minutos + minutosNoturnos + minutosNoturnosAntesJornada;
    if (somaTodosMinutos > -10 && somaTodosMinutos < 10) {
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

      if (minutosNoturnosAntesJornada > 0) {
        let saldoMinutosNoturnoAntesJornada = minutosNoturnosAntesJornada;

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
      output.diurno.ext1 = minutos;
    }

    if (minutosNoturnos > 0 || minutosNoturnosAntesJornada > 0) {
      const [ext1, ext2, ext3] = this.inserirRegraPorHoraExtra({
        minutos: minutosNoturnos + minutosNoturnosAntesJornada,
        parametros: [60, 60, 9999],
      });
      output.noturno = { ext1, ext2, ext3 };
    } else if (minutosNoturnos < 0) output.noturno = { ext1: minutosNoturnos, ext2: 0, ext3: 0 };

    return output;
  }

  inserirRegraPorHoraExtra(input: { minutos: number; parametros: number[] }): number[] {
    const output = input.parametros.map((parametro) => {
      let minutos = 0;

      if (input.minutos <= parametro) minutos = input.minutos;
      else minutos = parametro;

      input.minutos = input.minutos - (input.minutos <= parametro ? input.minutos : parametro);

      return minutos;
    });

    return output.map((value) => Number(value));
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
}
