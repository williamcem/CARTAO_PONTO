import { ListarCidRepsository } from "@infra/db/postgresdb/listar-CID-repository/listar-CID-repository";

import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./listar-CID-protocols";

export class ListarCIDController implements Controller {
  constructor(private readonly CIDPostgresRepository: ListarCidRepsository) {}

  async handle(): Promise<HttpResponse> {
    try {
      const cid = await this.CIDPostgresRepository.list();

      // Envolver o resultado em um objeto chamado data
      return ok({ cid });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
