import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./buscar-alteracao-turno-protocols";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { BuscarAlteracaoTurnoPostgresRepository } from "@infra/db/postgresdb/buscar-alteracao-turno/buscarta-alteracao-turno";

export class BuscarAlteracaoTurnoController implements Controller {
  constructor(private readonly buscarAlteracaoTurnoPostgresRepository: BuscarAlteracaoTurnoPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { cartaoId } = httpRequest.query;

      if (!cartaoId) return badRequest(new FuncionarioParamError("Falta id do cartão"));

      const alteracoes = await this.buscarAlteracaoTurnoPostgresRepository.findMany({
        cartaoId: Number(cartaoId),
      });

      return ok({ message: alteracoes });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
