import { ListarAcompanahanteRepsository } from "@infra/db/postgresdb/listar-acompanhante/listar-acompanhante-repository";

import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./listar-acompanhante-protocols";

export class ListarAcompanhanteController implements Controller {
  constructor(private readonly localidadePostgresRepository: ListarAcompanahanteRepsository) {}

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
