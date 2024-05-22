import { HttpResponse, Controller, HttpRequest } from "./procurra-funcionario-protocols";
import { serverError, ok, badRequest, notFoundRequest } from "../../helpers/http-helpers";
import { FuncionarioPostgresRepository } from "../../../infra/db/postgresdb/get-funcionario/get-funcionario";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { LancarDiaPostgresRepository } from "@infra/db/postgresdb/lancar-dia/lancar-dia";

export class LancarDiaController implements Controller {
  constructor(private readonly lancarDiaPostgresRepository: LancarDiaPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { periodoId, entrada, saida, cartao_dia_id } = httpRequest?.body;

      if (!periodoId) return badRequest(new FuncionarioParamError("Falta id do periodo!"));
      if (!entrada) return badRequest(new FuncionarioParamError("Falta entrada!"));
      if (!saida) return badRequest(new FuncionarioParamError("Falta saida!"));
      if (!cartao_dia_id) return badRequest(new FuncionarioParamError("Falta sequencia do cartão!"));

      const saved = await this.lancarDiaPostgresRepository.upsert({
        cartao_dia_id,
        entrada,
        periodoId,
        saida,
        statusId: 1,
      });

      if (!saved) throw "Erro ao salvar lançamento!";

      return ok({ message: "Salvo com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
