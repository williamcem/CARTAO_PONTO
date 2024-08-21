import { FuncionarioImpressaoCalculoPostgresRepository } from "../../../infra/db/postgresdb/get-funcionario-impressao-calculo/get-funcionario-impressao-calculo";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./procurra-funcionario-impressao-calculoprotocols";
import moment from "moment";
import "moment/locale/pt-br";

interface ResumoDoDiaOutput {
  diurno: { ext1: number; ext2: number; ext3: number };
  noturno: { ext1: number; ext2: number; ext3: number };
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
      const { cartaoId, localidade, funcionariosId, onlyDay, referencia, showLegacy } = httpRequest?.query;

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
        const resumoCartao = {
          atual: { diurno: { ext1: 0, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } },
          anterior: { diurno: { ext1: 0, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } },
        };

        const dias = cartao.cartao_dia.map((dia) => {
          let dataFormatada = moment.utc(dia.data).format("DD/MM/YYYY ddd").toUpperCase();

          if (!onlyDays) {
            let resumoLegado = {
              diurno: "",
              noturno: "",
            };

            const contemAusencia = dia.eventos.some((evento) => evento.tipoId === 2);

            const eventos = dia.eventos.map((evento) => {
              return { minutos: evento.minutos, tipoId: evento.tipoId || 0, tratado: evento.tratado };
            });

            const abono = { minutos: 0 };

            dia.atestado_abonos.map((abono) => abono.minutos + abono.minutos);

            const resumo = this.calcularResumoPorDia({
              dia: { id: dia.id, eventos, abono, cargaHorariaTotal: dia.cargaHor, contemAusencia },
              resumoCartao,
            });

            if (showLegacy) {
              resumoLegado.diurno = `${resumo.diurno.ext1 + resumo.diurno.ext2}/${resumo.diurno.ext3}`;
              resumoLegado.noturno = `${resumo.noturno.ext1 + resumo.noturno.ext2}/${resumo.noturno.ext3}`;
            }

            resumoCartao.atual.diurno.ext1 += resumo.diurno.ext1;
            resumoCartao.atual.diurno.ext2 += resumo.diurno.ext2;
            resumoCartao.atual.diurno.ext3 += resumo.diurno.ext3;

            resumoCartao.atual.noturno.ext1 += resumo.noturno.ext1;
            resumoCartao.atual.noturno.ext2 += resumo.noturno.ext2;
            resumoCartao.atual.noturno.ext3 += resumo.noturno.ext3;

            const periodos: { entrada: string; saida: string; periodoId: number }[] = [];

            dia.cartao_dia_lancamentos.map((lancamento) => {
              periodos.push({
                entrada: moment.utc(lancamento.entrada).format("HH:mm"),
                saida: moment.utc(lancamento.saida).format("HH:mm"),
                periodoId: lancamento.periodoId,
              });
            });

            if (showLegacy)
              return {
                data: dia.data,
                dataFormatada,
                resumo,
                periodos,
                resumoLegado,
                contemAusencia,
                status: dia.cartao_dia_status,
                id: dia.id,
              };

            return { data: dia.data, dataFormatada, resumo, periodos, contemAusencia, status: dia.cartao_dia_status, id: dia.id };
          }

          return { data: dia.data, dataFormatada, status: dia.cartao_dia_status, id: dia.id };
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

    input.dia.eventos.filter((evento) => {
      if (evento.tipoId !== 8 && evento.tipoId !== 11 && evento.tipoId !== 4 && evento.tipoId !== 2 && evento.tipoId !== 13)
        minutosDiurnos += evento.minutos;
    });

    input.dia.eventos.filter((evento) => {
      if (evento.tipoId === 4) minutosNoturnos += evento.minutos;
    });

    existeFaltaNoturna = input.dia.eventos.some((evento) => evento.tipoId === 13);

    if (minutosDiurnos == 0 && minutosNoturnos == 0 && !input.dia.contemAusencia) return output;

    minutosDiurnos = minutosDiurnos - input.dia.cargaHorariaTotal;

    const minutos = this.executarCalculo({
      existeFaltaNoturna,
      minutosDiurnos,
      saldoAtual,
    });

    if (minutos > 0) {
      const [ext1, ext2, ext3] = this.inserirRegraPorHoraExtra({ minutos: minutos, parametros: [60, 60, 9999] });
      output.diurno = { ext1, ext2, ext3 };
    } else if (minutos < 0) {
      output.diurno.ext1 = minutos;
    }

    if (minutosNoturnos > 0) {
      const [ext1, ext2, ext3] = this.inserirRegraPorHoraExtra({ minutos: minutosNoturnos, parametros: [60, 60, 9999] });
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
