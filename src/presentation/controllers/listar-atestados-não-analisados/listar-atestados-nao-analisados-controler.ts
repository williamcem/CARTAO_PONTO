import { ListarAtestadoRepsository } from "@infra/db/postgresdb/listar-atestados-não-analisados/listar-atestados-nao-analisados";

import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./listar-atestados-nao-analisados-protocols";

export class ListarAtestadoController implements Controller {
  constructor(private readonly AtestadoPostgresRepository: ListarAtestadoRepsository) {}

  async handle(): Promise<HttpResponse> {
    try {
      const atestados = await this.AtestadoPostgresRepository.list();
      return ok({ atestados });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
