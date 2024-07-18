import { AtestadoAprovadoRepository } from "@infra/db/postgresdb/atestado-aprovado-repository/atestado-aprovado-repository";

import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./cadastrar-atestado-aprovado-protocols";

export class AtestadoAprovadoController implements Controller {
  constructor(private readonly atestadoAprovadoRepository: AtestadoAprovadoRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id, inicio, fim, statusId } = httpRequest.body;

      if (!id) return badRequest(new FuncionarioParamError("Falta o ID do atestado!"));
      if (!inicio) return badRequest(new FuncionarioParamError("Falta a data de início!"));
      if (!fim) return badRequest(new FuncionarioParamError("Falta a data de fim!"));

      const result = await this.atestadoAprovadoRepository.addInicioFim({ id, inicio, fim, statusId });

      if (!result) throw new Error("Erro ao atualizar atestado!");

      return ok({ message: "Atestado atualizado com sucesso" });
    } catch (error) {
      console.error("Erro ao atualizar atestado:", error);
      return serverError();
    }
  }
}
