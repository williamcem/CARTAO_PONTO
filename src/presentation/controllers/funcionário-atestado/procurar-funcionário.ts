import { CalcularResumoPostgresRepository } from "../../../infra/db/postgresdb/calcular-resumo/calcular-resumo-repository";
import { FuncionarioAtestadoPostgresRepository } from "../../../infra/db/postgresdb/funcionario-atestado/funcionario-atestado";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./procurra-funcionario-protocols";

export class FuncionarioAtestadoController implements Controller {
  constructor(
    private readonly funcionarioAtestadoPostgresRepository: FuncionarioAtestadoPostgresRepository,
    private readonly calcularResumoPostgresRepository: CalcularResumoPostgresRepository,
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { identificacao } = httpRequest?.query;

      if (!identificacao) return badRequest(new FuncionarioParamError("Falta Identificação do funcionário!"));

      const funcionario = await this.funcionarioAtestadoPostgresRepository.atestadoFuncionario(identificacao);

      // Verifica se nenhum funcionário foi encontrado
      if (!identificacao) return notFoundRequest({ message: "Identificador não encontrado", name: "Error" });

      // Calcular o resumo
      const resumoCalculado = await this.calcularResumoPostgresRepository.calc(identificacao);

      // Retorna o(s) funcionário(s) encontrado(s)
      return ok({ message: "Identificador encontrado com sucesso", data: funcionario, resumo: resumoCalculado });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
