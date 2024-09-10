import { badRequest, badRequestNovo, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./criar-agrupamento-localidade-protocols";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { CriarAgrupamentoLocalidadePostgresRepository } from "@infra/db/postgresdb/criar-agrupamento-localidade/criar-agrupamento-localidade";

export class CriarAgrupamentoLocalidadeController implements Controller {
  constructor(private readonly criarAgrupamentoLocalidadePostgresRepository: CriarAgrupamentoLocalidadePostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const {
        localidades,
      }: {
        localidades: { codigo: string }[];
      } = httpRequest.body;

      if (!localidades) return badRequestNovo({ message: "Falta localidades!" });

      if (!localidades?.length) return badRequestNovo({ message: "Localidades é um Array!" });

      if (localidades?.length <= 1) return badRequestNovo({ message: "Favor passar mais de uma localidade para agrupar!" });

      for (const localidade of localidades) {
        const existLocalidade = await this.criarAgrupamentoLocalidadePostgresRepository.findFisrtLocalidade({
          codigo: localidade.codigo,
        });

        if (!existLocalidade) return notFoundRequest(new FuncionarioParamError(`Código de localidade ${localidade} não existe!`));
      }

      const result = await this.criarAgrupamentoLocalidadePostgresRepository.createAgrupamentoLocalidade({
        codigos: localidades.map((localidade) => localidade.codigo),
      });

      if (!result) return serverError();

      return ok({
        message: {
          agrupamentoLocalidade: {
            id: result.id,
          },
        },
      });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }

  mensagemMinutosDivergente(input: {
    periodo: "diurno" | "noturno";
    nome: "extra 1" | "extra 2" | "extra 3";
    resumoSistema: number;
    somaDoInformado: number;
  }) {
    let message = "";

    if (input.resumoSistema === input.somaDoInformado) {
    } else if (input.resumoSistema > input.somaDoInformado) {
      message = `Está faltando ${input.resumoSistema - input.somaDoInformado} minutos no ${input.nome} ${input.periodo}!`;
    } else {
      message = `Está sobrando ${input.somaDoInformado - input.resumoSistema} minutos no ${input.nome} ${input.periodo}!`;
    }

    return message;
  }

  buscarPendenciaCartao(input: {
    cartao: {
      dias: {
        id: number;
        data: Date;
        cargaHor: number;
        eventos: { id: number; hora: string; tipoId: number | null; tratado: boolean }[];
        lancamentos: { periodoId: number; validadoPeloOperador: boolean }[];
      }[];
    };
  }) {
    const diasSemLancamento: { id: number; data: Date }[] = [];
    const lancamentosNaoValidado: { id: number; data: Date; lancamentos: { periodoId: number }[] }[] = [];
    const ocorrenciasNaoTratada: { id: number; data: Date; eventos: { id: number; hora: string }[] }[] = [];

    input.cartao.dias.map((dia) => {
      if (dia.cargaHor === 0) return;

      if (!dia.eventos.length) {
        diasSemLancamento.push({ data: dia.data, id: dia.id });
      }

      dia.lancamentos.map((lancamento) => {
        if (lancamento.validadoPeloOperador) return undefined;

        const existIndex = lancamentosNaoValidado.findIndex((lancErro) => lancErro.id === dia.id);
        if (existIndex !== -1) lancamentosNaoValidado[existIndex].lancamentos.push({ periodoId: lancamento.periodoId });
        else
          lancamentosNaoValidado.push({
            id: dia.id,
            data: dia.data,
            lancamentos: [{ periodoId: lancamento.periodoId }],
          });
      });

      dia.eventos.map((evento) => {
        if (evento.tipoId === 2 && !evento.tratado) {
          const existeIndexDia = ocorrenciasNaoTratada.findIndex((eve) => eve.id === dia.id);

          if (existeIndexDia !== -1) ocorrenciasNaoTratada[existeIndexDia].eventos.push({ id: evento.id, hora: evento.hora });
          else
            ocorrenciasNaoTratada.push({
              id: dia.id,
              data: dia.data,
              eventos: [{ id: evento.id, hora: evento.hora }],
            });
        }
      });
    });

    return { diasSemLancamento, lancamentosNaoValidado, ocorrenciasNaoTratada };
  }
}
