import { RetornoSolucaoRepository } from "../../../infra/db/postgresdb/retorno-solucao/retorno-solucao-repository";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, badRequestNovo, notFoundNovo, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./retornar-solucao";

export class RetornarSolucaoController implements Controller {
  constructor(private readonly retornoSolucaoRepository: RetornoSolucaoRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { eventoId } = httpRequest?.body;

    try {
      if (!eventoId) return badRequestNovo({ message: "Falta informar o Id do evento!" });

      const evento = await this.retornoSolucaoRepository.findFisrt({ id: Number(eventoId) });
      if (!evento) return notFoundNovo({ message: "Evento não localizado!" });

      const deletado = await this.retornoSolucaoRepository.delete({ id: evento.id });

      if (!deletado) return serverError();

      return ok({ message: "Solução revertida com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
