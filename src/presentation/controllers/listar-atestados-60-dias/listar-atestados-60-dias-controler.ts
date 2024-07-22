import { ListarAtestados60DiasRepository } from "@infra/db/postgresdb/listar-atestados-60-dias/listar-atestados-60-dias";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./listar-atestados-60-dias-protocols";

export class ListarAtestado60DiasController implements Controller {
  constructor(private readonly atestadoPostgresRepository: ListarAtestados60DiasRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { funcionarioId } = httpRequest.query;

      if (!funcionarioId) return badRequest(new FuncionarioParamError("Falta a identificação do funcionário!"));

      const atestados = await this.atestadoPostgresRepository.listar60Dias(Number(funcionarioId));

      if (!atestados || atestados.length === 0) {
        return ok({ message: "Nenhum atestado encontrado para esta identificação." });
      }

      return ok({ atestados });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
