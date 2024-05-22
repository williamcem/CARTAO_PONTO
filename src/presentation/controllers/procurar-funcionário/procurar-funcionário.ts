import { HttpResponse, Controller, HttpRequest } from "./procurra-funcionario-protocols";
import { serverError, ok, badRequest, notFoundRequest } from "../../helpers/http-helpers";
import { FuncionarioPostgresRepository } from "../../../infra/db/postgresdb/get-funcionario/get-funcionario";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";

export class GetFuncionarioController implements Controller {
  constructor(private readonly funcionarioPostgresRepository: FuncionarioPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { identificacao, localidade } = httpRequest?.query;

      if (!identificacao) return badRequest(new FuncionarioParamError("identificacao não fornecido!"));
      if (!localidade) return badRequest(new FuncionarioParamError("localidade não fornecido!"));

      const funcionarios = await this.funcionarioPostgresRepository.findFisrt(identificacao, localidade);

      // Verifica se nenhum funcionário foi encontrado
      if (!funcionarios) return notFoundRequest({ message: "Identificador não encontrado", name: "Error" });

      // Retorna um array contendo o(s) funcionário(s) encontrado(s) juntamente com a mensagem
      return ok({ message: "Identificador encontrado com sucesso", data: funcionarios });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
