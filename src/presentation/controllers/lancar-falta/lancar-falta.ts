import { LancamentoFaltaPostgresRepository } from "@infra/db/postgresdb/lanca-falta/lanca-falta";

import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./lancar-falta-protocols";

export class GetLancarFaltaController implements Controller {
  constructor(private readonly lancamentoFaltaPostgresRepository: LancamentoFaltaPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { cartaoDiaId, periodoId, statusId, userName } = httpRequest?.body;

      if (!cartaoDiaId) return badRequest(new FuncionarioParamError("Falta id do cartão dia"));
      if (!periodoId) return badRequest(new FuncionarioParamError("Falta periodo do cartão dia"));
      if (!statusId) return badRequest(new FuncionarioParamError("Falta status do cartão dia"));
      if (!userName) return badRequest(new FuncionarioParamError("Falta usuário para lançar cartão"));

      this.lancamentoFaltaPostgresRepository.upsert({ cartaoDiaId, periodoId, statusId, userName });
      return ok({ message: "Falta aplicada com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
