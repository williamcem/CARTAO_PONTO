import { RetornoSolucaoRepository } from "../../../infra/db/postgresdb/retorno-solucao/retorno-solucao-repository";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./retornar-solucao";

export class RetornarSolucaoController implements Controller {
  constructor(private readonly retornoSolucaoRepository: RetornoSolucaoRepository) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { cartaoDiaId } = httpRequest?.body;

    try {
      if (!cartaoDiaId) return badRequest(new FuncionarioParamError("Falta irformar o dia!"));

      const eventosResetados = await this.retornoSolucaoRepository.resetTratado({ cartaoDiaId });

      if (!eventosResetados) throw "Erro ao resetar eventos!";

      return ok({ message: "Eventos resetados com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
