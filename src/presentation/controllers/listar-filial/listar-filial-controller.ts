import { ListarFilialRepsository } from "@infra/db/postgresdb/listar-filial-repository/listar-status-lancamento-repository";

import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./listar-filial-protocols";

export class ListarStatusController implements Controller {
  constructor(private readonly listarFilialRepsository: ListarFilialRepsository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidade } = httpRequest.query;

      if (!localidade) {
        return badRequest(new FuncionarioParamError("Localidade não fornecida"));
      }

      const funcionarios = (await this.listarFilialRepsository.listByLocalidade(localidade)).sort(
        (a, b) => Number(a.identificacao) - Number(b.identificacao),
      );

      return ok({ funcionarios });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
