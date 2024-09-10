import { LocalidadePostgresRepository } from "@infra/db/postgresdb/procurar-localidades/procurar-localidades";

import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./procurra-funcionario-protocols";

export class ProcurarLocalidadeController implements Controller {
  constructor(private readonly localidadePostgresRepository: LocalidadePostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const {
        notGroupId,
      }: {
        notGroupId: number;
      } = httpRequest.query;

      const localidades = await this.localidadePostgresRepository.findMany({
        not: { groupId: notGroupId ? Number(notGroupId) : undefined },
      });

      const output = localidades.filter((localidade) => {
        if (!notGroupId) return localidade;

        if (localidade.grupoLocalidadeId !== Number(notGroupId)) return localidade;
      });
      return ok(output);
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
