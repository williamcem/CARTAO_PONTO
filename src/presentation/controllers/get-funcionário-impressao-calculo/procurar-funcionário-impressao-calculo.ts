import { CalcularResumoImpressaoPostgresRepository } from "../../../infra/db/postgresdb/calcular-resumo-impressao/calcular-resumo-repository";
import { FuncionarioImpressaoCalculoPostgresRepository } from "../../../infra/db/postgresdb/get-funcionario-impressao-calculo/get-funcionario-impressao-calculo";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./procurra-funcionario-impressao-calculoprotocols";

export class GetFuncionarioImpressaoCalculoController implements Controller {
  constructor(
    private readonly funcionarioImpressaoCalculoPostgresRepository: FuncionarioImpressaoCalculoPostgresRepository,
    private readonly calcularResumoImpressaoPostgresRepository: CalcularResumoImpressaoPostgresRepository,
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidade } = httpRequest?.query;

      if (!localidade) return badRequest(new FuncionarioParamError("localidade não fornecido!"));

      const funcionarios = await this.funcionarioImpressaoCalculoPostgresRepository.findAllByLocalidade(localidade);

      // Verifica se nenhum funcionário foi encontrado
      if (!funcionarios || funcionarios.length === 0)
        return notFoundRequest({ message: "Nenhum funcionário encontrado na localidade fornecida", name: "Error" });

      // Calcular o resumo
      const resumoCalculado = await this.calcularResumoImpressaoPostgresRepository.calc(localidade);

      // Retorna o(s) funcionário(s) encontrado(s) juntamente com a mensagem e o resumo
      return ok({ message: "Funcionários encontrados com sucesso", data: funcionarios, resumo: resumoCalculado });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
