import { DbAddDeleteCartao } from "../../../data/usecase/delete-cartoa/db-add-dele-cartoa";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./delete-cartao-protocools";

export class DeleteCartaoController implements Controller {
  private readonly dbAddDeleteCartao: DbAddDeleteCartao;

  constructor(dbAddDeleteCartao: DbAddDeleteCartao) {
    this.dbAddDeleteCartao = dbAddDeleteCartao;
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { referencia } = httpRequest.body;

      if (!referencia) {
        return badRequest(new FuncionarioParamError("Referência do mês não encontrada"));
      }

      // Validando a data no formato YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(referencia)) {
        return badRequest(new FuncionarioParamError("Formato de referência inválido. Use YYYY-MM-DD."));
      }

      await this.dbAddDeleteCartao.deleteByReferencia({ referencia });

      return ok({ message: "Cartão do mês deletado com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
