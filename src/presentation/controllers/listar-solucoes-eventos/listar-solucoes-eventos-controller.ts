import { SolucoesEventosPostgresRepository } from "@infra/db/postgresdb/listar-solucoes-eventos/listar-solucoes-eventos";

import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./listar-solucoes-eventos-protocols";

export class ListarSolucoesEventosController implements Controller {
  constructor(private readonly solucoesEventosPostgresRepository: SolucoesEventosPostgresRepository) {}

  async handle(): Promise<HttpResponse> {
    try {
      return ok(await this.solucoesEventosPostgresRepository.list());
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
