import { BuscarTodosPostgresRepository } from "../../../infra/db/postgresdb/buscar-todos-funcionarios.ts/buscas-todos-repository";
import { ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./buscar-todos-protocols";

export class BuscarTodosFuncionarioController implements Controller {
  constructor(private readonly funcionarioPostgresRepository: BuscarTodosPostgresRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidade, identificacao } = req.query;

      const funcionarios = await this.funcionarioPostgresRepository.listAll({
        identificacao,
        localidade: { codigo: localidade },
      });

      // Retorna um array contendo todos os funcionários juntamente com a mensagem
      return ok({ message: "Funcionários encontrados com sucesso", data: funcionarios });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
