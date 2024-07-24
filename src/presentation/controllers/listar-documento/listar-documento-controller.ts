import { ListarDocumentoRepsository } from "@infra/db/postgresdb/listar-documento/listar-documento";

import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./listar-documento-protocols";

export class ListarDocumentoController implements Controller {
  constructor(private readonly localidadePostgresRepository: ListarDocumentoRepsository) {}

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
