import { ListarComprovantesRepsository } from "@infra/db/postgresdb/listar-comprovantes/listar-comprovantes";

import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./listar-acompanhante-protocols";

export class ListarComprovanteController implements Controller {
  constructor(private readonly listarComprovantesRepsository: ListarComprovantesRepsository) {}

  async handle(): Promise<HttpResponse> {
    try {
      const lancamentos = await this.listarComprovantesRepsository.list();

      // Envolver o resultado em um objeto chamado data
      return ok({ lancamentos });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
