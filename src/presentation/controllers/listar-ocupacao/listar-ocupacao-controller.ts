import { ListarOcupacaoRepsository } from "@infra/db/postgresdb/listar-ocupacao/listar-ocupacao";

import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./listar-ocupacao-protocols";

export class ListarOcupacaoController implements Controller {
  constructor(private readonly localidadePostgresRepository: ListarOcupacaoRepsository) {}

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
