import { RetornoSolucaoRepository } from "../../../infra/db/postgresdb/retorno-solucao/retorno-solucao-repository";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./retornar-solucao";

export class RetornarSolucaoController implements Controller {
  constructor(private readonly retornoSolucaoRepository: RetornoSolucaoRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { eventoId, cartaoDiaId } = httpRequest?.body;

    try {
      if (!eventoId) {
        return badRequest(new FuncionarioParamError("Falta informar o Id do evento!"));
      }

      if (!cartaoDiaId) {
        return badRequest(new FuncionarioParamError("Falta informar o Id do cartão dia!"));
      }

      const eventosResetados = await this.retornoSolucaoRepository.resetTratado({ eventoId, cartaoDiaId });

      if (!eventosResetados) {
        throw "Erro ao reverter solução!";
      }

      return ok({ message: "Solução revertida com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
