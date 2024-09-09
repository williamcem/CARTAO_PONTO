import { CriarEventosPostgresRepository } from "../../../infra/db/postgresdb/eventos/eventos-repository";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./eventos-protocols";

export class CriarEventosController implements Controller {
  constructor(private readonly criarEventosPostgresRepository: CriarEventosPostgresRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    try {
      const { cartao_dia_id } = req.body;

      // Verificar se o cartao_dia_id está presente
      if (!cartao_dia_id) {
        return badRequest(new Error("Falta o parâmetro cartao_dia_id!"));
      }

      // Criar os eventos passando o identificador corretamente do cartão dia correspondente
      const eventosCriados = await this.criarEventosPostgresRepository.add({ identificacao: String(cartao_dia_id) });

      // Verificar se os eventos foram criados com sucesso
      if (!eventosCriados) {
        throw new Error("Erro ao criar eventos!");
      }

      return ok({ message: "Eventos criados com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
