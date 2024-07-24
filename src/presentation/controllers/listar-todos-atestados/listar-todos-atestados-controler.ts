import { ListarTodosAtestadoRepsository } from "@infra/db/postgresdb/listar-todos-atestados/listar-todos-atestados";

import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./listar-todos-atestados-protocols";

export class ListarTodosAtestadoController implements Controller {
  constructor(private readonly atestadoPostgresRepository: ListarTodosAtestadoRepsository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { funcionarioId } = httpRequest.query;

      if (!funcionarioId) return badRequest(new FuncionarioParamError("Falta a identificação do funcionário!"));

      const atestados = await this.atestadoPostgresRepository.listarTodos(funcionarioId);

      if (!atestados || atestados.length === 0) {
        return ok({ message: "Nenhum atestado encontrado para esta identificação." });
      }

      return ok({ atestados });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
