import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./consultar-agrupamento-localidade-protocols";
import { ConsultarAgrupamentoLocalidadePostgresRepository } from "@infra/db/postgresdb/consultar-agrupamento-localidade/consultar-agrupamento-localidade";

export class ConsultarAgrupamentoLocalidadeController implements Controller {
  constructor(
    private readonly consultarAgrupamentoLocalidadePostgresRepository: ConsultarAgrupamentoLocalidadePostgresRepository,
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      return ok({ message: { agrupamentosLocalidade: await this.consultarAgrupamentoLocalidadePostgresRepository.findMany() } });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
