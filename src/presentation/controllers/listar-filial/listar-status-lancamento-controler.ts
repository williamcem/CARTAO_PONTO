import { ListarLancamentoRepsository } from "@infra/db/postgresdb/listar-status-lancamento-repository/listar-status-lancamento-repository";
import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpResponse } from "./listar-filial";

export class ListarStatusController implements Controller {
  constructor(private readonly listarLancamentoRepsository: ListarLancamentoRepsository) {}

  async handle(request: { filial: string }): Promise<HttpResponse> {
    try {
      const { filial } = request;
      const funcionarios = await this.listarLancamentoRepsository.listByFilial(filial);

      return ok({ funcionarios });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
