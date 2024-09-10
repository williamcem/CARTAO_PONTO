import { badRequestNovo, notFoundNovo, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./excluir-agrupamento-localidade-protocols";
import { ExcluirAgrupamentoLocalidadePostgresRepository } from "@infra/db/postgresdb/excluir-agrupamento-localidade/excluir-agrupamento-localidade";

export class ExcluirAgrupamentoLocalidadeController implements Controller {
  constructor(private readonly excluirAgrupamentoLocalidadePostgresRepository: ExcluirAgrupamentoLocalidadePostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const {
        id,
      }: {
        id: number;
      } = httpRequest.params;

      if (!id) return badRequestNovo({ message: "Falta id!" });

      const agrupamento = await this.excluirAgrupamentoLocalidadePostgresRepository.findFisrt({ id: Number(id) });

      if (!agrupamento) return notFoundNovo({ message: "Agrupamento inexistente!" });

      const excluido = await this.excluirAgrupamentoLocalidadePostgresRepository.delete({ id: agrupamento.id });

      if (!excluido) return serverError();

      return ok({
        message: { agrupamentoLocalidade: excluido },
      });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
