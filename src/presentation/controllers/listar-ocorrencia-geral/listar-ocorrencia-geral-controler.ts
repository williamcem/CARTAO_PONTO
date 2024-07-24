import { OcorrenciaGeralPostgresRepository } from "../../../infra/db/postgresdb/listar-ocorrencias-geral/listar-ocorrencias-repository";
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

      if (data.funcionarios.length === 0) {
        return notFoundRequest(new Error("Nenhum funcionário encontrado"));
      }

      const output = data.funcionarios.map((funcionario) => ({
        nome: funcionario.nome,
        identificacao: funcionario.identificacao,
      }));

      return ok(output);
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
