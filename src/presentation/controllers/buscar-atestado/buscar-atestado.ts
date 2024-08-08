import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./buscar-atestado-protocols";
import { BuscarAtestadoPostgresRepository } from "@infra/db/postgresdb/buscar-atestado/buscar-atestado";

export class BuscarAtestadoController implements Controller {
  constructor(private readonly buscarAtestadoPostgresRepository: BuscarAtestadoPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { pagina, quantidade } = httpRequest?.query;

      if (!pagina) return badRequest(new FuncionarioParamError("Falta pagina!"));

      if (!quantidade) return badRequest(new FuncionarioParamError("Falta quantidade!"));

      const atestadosEmAberto = await this.buscarAtestadoPostgresRepository.findMany({ statusId: 1 });

      const atestados = await this.buscarAtestadoPostgresRepository.findMany({
        not: { statusId: 1 },
        pagina: (Number(pagina) - 1) * Number(quantidade),
        quantidade: Number(quantidade),
        orderBy: { id: "desc" },
      });

      return ok([...atestadosEmAberto, ...atestados]);
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
