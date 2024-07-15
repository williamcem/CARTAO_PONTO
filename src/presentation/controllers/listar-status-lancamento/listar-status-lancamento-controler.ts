import { ListarLancamentoRepsository } from "@infra/db/postgresdb/listar-status-lancamento-repository/listar-status-lancamento-repository";

import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./listar-status-lancamnrto-protocols";

export class ListarStatusController implements Controller {
  constructor(private readonly localidadePostgresRepository: ListarLancamentoRepsository) {}

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
