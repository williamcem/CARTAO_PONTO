import { ListarCertidaoObitoPostgresRepository } from "@infra/db/postgresdb/listar-certidao-obito/listar-certidao-obito";

import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./listar-certidao-obito-protocols";

export class ListarCertidaoObitoController implements Controller {
  constructor(private readonly listarCertidaoObitoPostgresRepository: ListarCertidaoObitoPostgresRepository) {}

  async handle(): Promise<HttpResponse> {
    try {
      const lancamentos = await this.listarCertidaoObitoPostgresRepository.list();

      // Envolver o resultado em um objeto chamado lancamentos
      return ok({ lancamentos });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
