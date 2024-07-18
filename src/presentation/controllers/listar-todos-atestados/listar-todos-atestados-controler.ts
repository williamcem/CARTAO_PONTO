import { ListarTodosAtestadoRepsository } from "@infra/db/postgresdb/listar-todos-atestados/listar-todos-atestados";

import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./listar-todos-atestados-protocols";

export class ListarTodosAtestadoController implements Controller {
  constructor(private readonly AtestadoPostgresRepository: ListarTodosAtestadoRepsository) {}

  async handle(): Promise<HttpResponse> {
    try {
      const atestados = await this.AtestadoPostgresRepository.listarTodos();
      return ok({ atestados });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
