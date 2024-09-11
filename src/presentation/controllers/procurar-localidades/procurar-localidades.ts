import { LocalidadePostgresRepository } from "@infra/db/postgresdb/procurar-localidades/procurar-localidades";

import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./procurra-funcionario-protocols";

export class ProcurarLocalidadeController implements Controller {
  constructor(private readonly localidadePostgresRepository: LocalidadePostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const {
        notGroupId,
        codigoLocalidade,
      }: {
        notGroupId: number;
        codigoLocalidade: string;
      } = httpRequest.query;

      const localidades = await this.localidadePostgresRepository.findMany({
        not: { groupId: notGroupId ? Number(notGroupId) : undefined },
      });

      let grupoId: undefined | number | null = undefined;

      if (codigoLocalidade)
        grupoId = (await this.localidadePostgresRepository.findFisrt({ codigo: codigoLocalidade }))?.grupoLocalidadeId;

      const output = localidades.filter((localidade) => {
        if (!notGroupId && !grupoId) return localidade;
        else if (grupoId && grupoId === localidade.grupoLocalidadeId) return localidade;
        else if (notGroupId && localidade.grupoLocalidadeId !== Number(notGroupId)) return localidade;
      });

      return ok(output);
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
