import { ListarStatusDocumentoRepsository } from "@infra/db/postgresdb/listar-status-documento/listar-status-documento";

import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./listar-sttaus-documento-protocols";

export class ListarStatusDocumentoController implements Controller {
  constructor(private readonly localidadePostgresRepository: ListarStatusDocumentoRepsository) {}

  async handle(): Promise<HttpResponse> {
    try {
      const lancamentos = await this.localidadePostgresRepository.list();

      // Envolver o resultado em um objeto chamado data
      return ok({ lancamentos });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
