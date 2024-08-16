import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./buscar-cid-protocols";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { BuscarCidPostgresRepository } from "@infra/db/postgresdb/buscar-cid/buscar-cid";

export class BuscarCidController implements Controller {
  constructor(private readonly buscarCidPostgresRepository: BuscarCidPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { codigo } = httpRequest.query;

      if (!codigo) return badRequest(new FuncionarioParamError("Falta código do cid!"));

      const cids = await this.buscarCidPostgresRepository.findMany({
        codigo,
      });

      return ok({ message: cids });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
