import { ListarDescricacoRepsository } from "@infra/db/postgresdb/listar-descricacao-repository/listar-descricacao-repository";

import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./listar-descricacao-protocols";

export class ListarDescricacoController implements Controller {
  constructor(private readonly CIDPostgresRepository: ListarDescricacoRepsository) {}

  async handle(): Promise<HttpResponse> {
    try {
      const descricaco = await this.CIDPostgresRepository.list();

      // Envolver o resultado em um objeto chamado data
      return ok({ descricaco });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
