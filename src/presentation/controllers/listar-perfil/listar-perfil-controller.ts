import { ListarPerfilRepository } from "@infra/db/postgresdb/listar-perfil/listar-perfil-repository";
import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./listar-perfil";

export class ListarPerfilController implements Controller {
  constructor(private readonly listarPerfilRepository: ListarPerfilRepository) {}

  async handle(): Promise<HttpResponse> {
    try {
      return ok(await this.listarPerfilRepository.findMany());
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
