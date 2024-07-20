import { ListarDescricacoRepsository } from "@infra/db/postgresdb/listar-descricao-repository/listar-descricao-repository";

import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./listar-descricao-protocols";

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
