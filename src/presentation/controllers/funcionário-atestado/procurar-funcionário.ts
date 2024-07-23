import { FuncionarioAtestadoPostgresRepository } from "../../../infra/db/postgresdb/funcionario-atestado/funcionario-atestado";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./procurra-funcionario-protocols";

export class FuncionarioAtestadoController implements Controller {
  constructor(private readonly funcionarioAtestadoPostgresRepository: FuncionarioAtestadoPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { funcionarioId } = httpRequest?.query;

      if (!funcionarioId) return badRequest(new FuncionarioParamError("Falta o Id do funcionário!"));

      const funcionario = await this.funcionarioAtestadoPostgresRepository.atestadoFuncionario(funcionarioId);

      // Verifica se nenhum funcionário foi encontrado
      if (!funcionarioId) return notFoundRequest({ message: "Identificador não encontrado", name: "Error" });

      // Retorna o(s) funcionário(s) encontrado(s)
      return ok({ message: "Identificador encontrado com sucesso", data: funcionario });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
