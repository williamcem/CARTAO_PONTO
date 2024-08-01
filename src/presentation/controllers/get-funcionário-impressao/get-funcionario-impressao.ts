import { FuncionarioImpressaoPostgresRepository } from "../../../infra/db/postgresdb/get-funcionario-impressao/get-funcionario-impressao";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./get-funcionario-impresao-protocols";

export class GetFuncionarioImpressaoController implements Controller {
  constructor(private readonly funcionarioImpressaoPostgresRepository: FuncionarioImpressaoPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidade } = httpRequest?.query;

      if (!localidade) return badRequest(new FuncionarioParamError("localidade não fornecido!"));

      const funcionario = await this.funcionarioImpressaoPostgresRepository.findFisrt(localidade);

      // Verifica se nenhum funcionário foi encontrado
      if (!funcionario) return notFoundRequest({ message: "Identificador não encontrado", name: "Error" });

      // Retorna o(s) funcionário(s) encontrado(s) juntamente com a mensagem e o resumo
      return ok({ message: "Identificador encontrado com sucesso", data: funcionario });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
