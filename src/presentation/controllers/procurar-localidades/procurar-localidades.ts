import { HttpResponse, Controller } from "./procurra-funcionario-protocols";
import { serverError, ok } from "../../helpers/http-helpers";
import { LocalidadePostgresRepository } from "@infra/db/postgresdb/procurar-localidades/procurar-localidades";

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
