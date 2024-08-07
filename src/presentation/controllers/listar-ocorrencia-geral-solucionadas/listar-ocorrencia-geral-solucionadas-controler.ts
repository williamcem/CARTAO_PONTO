import { OcorrenciaGeralSolucionadaPostgresRepository } from "../../../infra/db/postgresdb/listar-ocorrencias-geral-solucionadas/listar-ocorrencias-geral-solucionadas-repository";
import { FuncionarioParamError, OcorrenciasNull } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./listar-ocorrencias-protocols";

export class OcorrenciaGeralSolucionadaController implements Controller {
  constructor(private readonly ocorrenciaGeralSolucionadaPostgresRepository: OcorrenciaGeralSolucionadaPostgresRepository) {}

  async handle(httRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidade } = httRequest?.query;

      if (!localidade) {
        return badRequest(new Error("Localidade não informada"));
      }

      const data = await this.ocorrenciaGeralSolucionadaPostgresRepository.findOcorrencia(localidade);

      if (data.funcionarios.length === 0) {
        return notFoundRequest(new Error("Nenhum funcionário encontrado"));
      }

      const output = data.funcionarios.map((funcionario) => ({
        nome: funcionario.nome,
        identificacao: funcionario.identificacao,
      }));

      return ok(output);
    } catch (error) {
      if (error instanceof OcorrenciasNull) {
        return badRequest(new FuncionarioParamError(error.message));
      }
      console.error(error);
      return serverError();
    }
  }
}
