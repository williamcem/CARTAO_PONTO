import { CriarEventosPostgresRepository } from "../../../infra/db/postgresdb/eventos/eventos-repository";
import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./eventos-documentos-protocols";

export class CriarEventosController implements Controller {
  constructor(private readonly criarEventosPostgresRepository: CriarEventosPostgresRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    try {
      console.log("req.query.identificacao", req.query.identificacao);
      const eventosCriados = await this.criarEventosPostgresRepository.add({ identificacao: req.query.identificacao });

      if (!eventosCriados) throw "Erro ao criar eventos!";

      return ok({ message: "Eventos criados com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
