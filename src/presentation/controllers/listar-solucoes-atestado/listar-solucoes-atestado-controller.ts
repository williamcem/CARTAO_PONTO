import { SolucoesAtestadoPostgresRepository } from "@infra/db/postgresdb/listar-solucoes-atestado/listar-solucoes-atestado";

import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./listar-solucoes-atestado-protocols";

export class ListarSolucoesAtestadoController implements Controller {
  constructor(private readonly solucoesEventosPostgresRepository: SolucoesAtestadoPostgresRepository) {}

  async handle(): Promise<HttpResponse> {
    try {
      return ok(await this.solucoesEventosPostgresRepository.list());
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
