import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./listar-usuario-protocols";
import { ListarUsuarioPostgresRepository } from "@infra/db/postgresdb/listar-usuario/listar-usuario-repository";

export class ListarUsuarioController implements Controller {
  constructor(private readonly listarUsuarioPostgresRepository: ListarUsuarioPostgresRepository) {}

  async handle(httRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidadeCodigo } = httRequest?.query;

      const usuarios = await this.listarUsuarioPostgresRepository.findMany({
        localidadeCodigo,
      });

      return ok(usuarios);
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
