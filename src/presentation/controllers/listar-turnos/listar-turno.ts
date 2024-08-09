import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./listar-turno-protocols";
import { ListarTurnoPostgresRepository } from "@infra/db/postgresdb/listar-turno/listar-turno";

export class ListarTurnoController implements Controller {
  constructor(private readonly listarTurnoPostgresRepository: ListarTurnoPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      return ok(await this.listarTurnoPostgresRepository.findMany());
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
