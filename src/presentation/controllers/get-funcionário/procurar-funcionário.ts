import { CalcularResumoPostgresRepository } from "../../../infra/db/postgresdb/calcular-resumo/calcular-resumo-repository";
import { FuncionarioPostgresRepository } from "../../../infra/db/postgresdb/get-funcionario/get-funcionario";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./procurra-funcionario-protocols";

export class GetFuncionarioController implements Controller {
  constructor(
    private readonly funcionarioPostgresRepository: FuncionarioPostgresRepository,
    private readonly calcularResumoPostgresRepository: CalcularResumoPostgresRepository,
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { identificacao, localidade } = httpRequest?.query;

      if (!identificacao) return badRequest(new FuncionarioParamError("identificacao não fornecido!"));
      if (!localidade) return badRequest(new FuncionarioParamError("localidade não fornecido!"));

      const funcionario = await this.funcionarioPostgresRepository.findFisrt(identificacao, localidade);

      // Verifica se nenhum funcionário foi encontrado
      if (!funcionario) return notFoundRequest({ message: "Identificador não encontrado", name: "Error" });

      funcionario.cartao = funcionario?.cartao.map((cartao) => {
        const dias = cartao.cartao_dia.map((dia) => {
          const contemAusencia = dia.eventos.some((evento) => evento.tipoId === 2);

          return { ...dia, ...{ contemAusencia } };
        });
        return { ...cartao, ...{ cartao_dia: dias } };
      });

      // Calcular o resumo
      const resumoCalculado = await this.calcularResumoPostgresRepository.calc(identificacao);

      // Retorna o(s) funcionário(s) encontrado(s) juntamente com a mensagem e o resumo
      return ok({ message: "Identificador encontrado com sucesso", data: funcionario, resumo: resumoCalculado });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
