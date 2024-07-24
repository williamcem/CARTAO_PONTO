import { CalcularResumoPostgresRepository } from "../../../infra/db/postgresdb/calcular-resumo/calcular-resumo-repository";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./calcular-resumo-protocols";

export class CalcularResumoController implements Controller {
  constructor(private readonly calcularResumoPostgresRepository: CalcularResumoPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { identificacao } = httpRequest?.query;

      if (!identificacao) return badRequest(new FuncionarioParamError("identificacao não fornecido!"));

      const funcionario = await this.calcularResumoPostgresRepository.calc(identificacao);

      // Verifica se nenhum funcionário foi encontrado
      if (!funcionario) return notFoundRequest({ message: "Funcionário não encontrado", name: "Error" });

      // Retorna o(s) funcionário(s) encontrado(s) juntamente com a mensagem e o resumo
      return ok({ message: "Identificador encontrado com sucesso", data: funcionario });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
