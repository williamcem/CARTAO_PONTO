import { OcorrenciaGeralPostgresRepository } from "../../../infra/db/postgresdb/listar-ocorrencias-geral/listar-ocorrencias-repository";
import { FuncionarioParamError, OcorrenciasNull } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./listar-ocorrencias-protocols";

export class OcorrenciaGeralController implements Controller {
  constructor(private readonly ocorrenciaGeralPostgresRepository: OcorrenciaGeralPostgresRepository) {}

  async handle(httRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidade } = httRequest?.query;

      if (!localidade) {
        return badRequest(new Error("Localidade não informada"));
      }

      const data = await this.ocorrenciaGeralPostgresRepository.findOcorrencia(localidade);

      const funcionarios: { id: number; identificacao: string; nome: string }[] = [];

      data.map((funcionario) => {
        funcionario.cartao.map((cartao) => {
          cartao.cartao_dia.map((dia) => {
            let adicionar = false;

            if (dia.cartao_dia_lancamentos.length !== 0) {
              const naoValidado = dia.cartao_dia_lancamentos.find((lancamento) => !lancamento.validadoPeloOperador);
              if (naoValidado) return;
            }

            const ocorrencia = dia.eventos.find((evento) => evento.tipoId === 2);

            if (ocorrencia) adicionar = true;

            const intervalos = dia.eventos.filter((evento) => evento.tipoId === 8);

            if (intervalos.length > 1) adicionar = true;

            if (adicionar) {
              const existeIndexFuncionario = funcionarios.findIndex((func) => funcionario.id === func.id);

              if (existeIndexFuncionario === -1)
                funcionarios.push({ id: funcionario.id, identificacao: funcionario.identificacao, nome: funcionario.nome });
            }
          });
        });
      });

      return ok(funcionarios);
    } catch (error) {
      if (error instanceof OcorrenciasNull) {
        return badRequest(new FuncionarioParamError(error.message));
      }
      console.error(error);
      return serverError();
    }
  }
}
