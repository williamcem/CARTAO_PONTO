import { LocalidadePostgresRepository } from "@infra/db/postgresdb/procurar-localidades/procurar-localidades";

import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./procurra-funcionario-protocols";

export class ProcurarLocalidadeController implements Controller {
  constructor(private readonly localidadePostgresRepository: LocalidadePostgresRepository) {}

  async handle(): Promise<HttpResponse> {
    try {
      return ok(await this.localidadePostgresRepository.findMany());
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
