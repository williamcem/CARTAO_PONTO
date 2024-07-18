import { AtestadoRecusadoRepository } from "@infra/db/postgresdb/atestado-recusado-repository/atestado-recusado-repository";

import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./cadastrar-atestado-recusado-protocols";

export class AtestadoRecusadoController implements Controller {
  constructor(private readonly atestadoAprovadoRepository: AtestadoRecusadoRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id, inicio, fim, statusId, observacao } = httpRequest.body;

      if (!id) return badRequest(new FuncionarioParamError("Falta o ID do atestado!"));
      if (!observacao) return badRequest(new FuncionarioParamError("Falta a data de fim!"));

      const result = await this.atestadoAprovadoRepository.addObservacao({ id, inicio, fim, statusId, observacao });

      if (!result) throw new Error("Erro ao atualizar atestado!");

      return ok({ message: "Atestado atualizado com sucesso" });
    } catch (error) {
      console.error("Erro ao atualizar atestado:", error);
      return serverError();
    }
  }
}
