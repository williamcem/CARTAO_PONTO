import { SolucaoEventoRepository } from "../../../infra/db/postgresdb/solucao-eventos-repository/solucao-eventos-repository";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./eventos-protocols";

export class CriarEventoController implements Controller {
  constructor(private readonly solucaoEventoRepository: SolucaoEventoRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    const { eventos }: { eventos: { id: number; tipoId: number }[] } = httpRequest?.body;

    try {
      for (const { id, tipoId } of eventos) {
        if (!id) return badRequest(new FuncionarioParamError("Falta id do evento!"));
        if (!tipoId) return badRequest(new FuncionarioParamError("Falta o tipo de solução!"));
      }

      const eventoCriado = await this.solucaoEventoRepository.add(eventos);

      if (!eventoCriado) throw "Não foi possivel aplicar a solução!";

      return ok({ message: "Solução aplicada com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
