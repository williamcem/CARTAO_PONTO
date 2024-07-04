import { CriarEventosPostgresRepository } from "../../../infra/db/postgresdb/eventos/eventos-repository";
import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./eventos-protocols";

export class CriarEventosController implements Controller {
  constructor(private readonly criarEventosPostgresRepository: CriarEventosPostgresRepository) {}

  async handle(): Promise<HttpResponse> {
    try {
      const eventosCriados = await this.criarEventosPostgresRepository.add();

      if (!eventosCriados) throw "Erro ao criar eventos!";

      return ok({ message: "Eventos criados com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
