import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./buscar-funcionarios-referencia-localidade-protocols";
import moment from "moment";
import "moment/locale/pt-br";
import { BuscarFuncionarioReferenciaLocalidadePostgresRepository } from "@infra/db/postgresdb/buscar-funcionario-referencia-localidade/buscar-funcionario-referencia-localidade";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { BuscarTodosPostgresRepository } from "@infra/db/postgresdb/buscar-todos-funcionarios.ts/buscas-todos-repository";

export class BuscarFuncionarioReferenciaLocalidadeAgrupadaController implements Controller {
  constructor(
    private readonly buscarFuncionarioReferenciaLocalidadePostgresRepository: BuscarFuncionarioReferenciaLocalidadePostgresRepository,
    private readonly buscarTodosPostgresRepository: BuscarTodosPostgresRepository,
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidadeId, referencia } = httpRequest?.query;

      if (!localidadeId) return badRequest(new FuncionarioParamError("Falta localidade!"));

      if (!referencia) return badRequest(new FuncionarioParamError("Falta referência!"));

      if (!moment(referencia).isValid()) badRequest(new FuncionarioParamError("Data da referência inválida!"));

      const localidade = await this.buscarFuncionarioReferenciaLocalidadePostgresRepository.findFisrtLocalidade({ localidadeId });
      if (!localidade) return notFoundRequest(new FuncionarioParamError(`Localidade ${localidadeId} não encontrada!`));

      const cartao = await this.buscarFuncionarioReferenciaLocalidadePostgresRepository.findFisrtReferencia({
        referencia: new Date(referencia),
      });

      if (!cartao)
        return notFoundRequest(
          new FuncionarioParamError(`Não foi encontrado cartões para a referncia ${moment.utc(referencia).toDate()}!`),
        );

      let funcionarios = await this.buscarFuncionarioReferenciaLocalidadePostgresRepository.findManyFuncionarios({
        data: new Date(referencia),
        localidadeId,
      });

      const output: { id: number; nome: string; filial: string; identificacao: string; andamento: number; cartaoId: number }[] =
        [];

      for (const funcionario of funcionarios) {
        let andamento = 0;
        const dias = funcionario.cartao[0].cartao_dia.filter((dia) => moment(dia.data).isBefore(moment()) && dia.cargaHor != 0);
        let totalDiasParaTrabalhar = dias.length;
        let totalDiasTrabalhados = 0;

        for await (const dia of funcionario.cartao[0].cartao_dia) {
          if (dia.cargaHor === 0) continue;
          if (dia.cartao_dia_lancamentos.some((lancamento) => lancamento.validadoPeloOperador)) {
            totalDiasTrabalhados = totalDiasTrabalhados + 1;
            continue;
          }

          const abono = await this.buscarTodosPostgresRepository.findFisrtAtestado({
            funcionarioId: funcionario.id,
            cartaoDiaId: dia.id,
          });

          if (abono) {
            totalDiasTrabalhados = totalDiasTrabalhados + 1;
            continue;
          }
        }

        andamento = Number(((totalDiasTrabalhados * 100) / totalDiasParaTrabalhar).toFixed());

        output.push({
          andamento,
          filial: funcionario.filial,
          id: funcionario.id,
          identificacao: funcionario.identificacao,
          nome: funcionario.nome,
          cartaoId: funcionario.cartao[0].id,
        });
      }

      return ok({ funcionarios: output });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
