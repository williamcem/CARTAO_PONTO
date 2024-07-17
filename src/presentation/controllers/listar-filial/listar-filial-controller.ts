import { ListarFilialRepsository } from "@infra/db/postgresdb/listar-filial-repository/listar-status-lancamento-repository";

import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./listar-filial";

export class ListarStatusController implements Controller {
  constructor(private readonly listarFilialRepsository: ListarFilialRepsository) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { filial } = httpRequest.query;

      if (!filial) {
        return badRequest(new FuncionarioParamError("Filial não fornecida"));
      }

      const funcionarios = await this.listarFilialRepsository.listByFilial(filial);

      return ok({ funcionarios });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
