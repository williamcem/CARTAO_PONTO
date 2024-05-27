import { HttpResponse, Controller, HttpRequest } from "./procurra-funcionario-protocols";
import { serverError, ok, badRequest } from "../../helpers/http-helpers";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { LancarDiaPostgresRepository } from "@infra/db/postgresdb/lancar-dia/lancar-dia";

export class LancarDiaController implements Controller {
  constructor(private readonly lancarDiaPostgresRepository: LancarDiaPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { periodoId, entrada, saida, cartao_dia_id } = httpRequest?.body;

      if (!periodoId) return badRequest(new FuncionarioParamError("Falta id do periodo!"));
      if (!entrada) return badRequest(new FuncionarioParamError("Falta entrada!"));
      if (!saida) return badRequest(new FuncionarioParamError("Falta saida!"));
      if (!cartao_dia_id) return badRequest(new FuncionarioParamError("Falta sequencia do cartão!"));

      const entradaDate = new Date(entrada);
      const saidaDate = new Date(saida);

      if (isNaN(entradaDate.getTime()) || isNaN(saidaDate.getTime())) {
        return badRequest(new FuncionarioParamError("Formato de data inválido!"));
      }

      // Verificar se há conflitos de períodos
      const conflictingPeriodos = await this.lancarDiaPostgresRepository.findConflictingPeriodos(
        entradaDate,
        saidaDate,
        cartao_dia_id,
        periodoId,
      );
      if (conflictingPeriodos.length > 0) {
        return badRequest(new FuncionarioParamError("Período já existente!"));
      }

      // Calculando a diferença em minutos entre entrada e saída
      const diferenca = this.calcularDiferencaMinutos(entradaDate, saidaDate);

      const saved = await this.lancarDiaPostgresRepository.upsert({
        cartao_dia_id,
        entrada: entradaDate,
        periodoId,
        saida: saidaDate,
        statusId: 1,
        diferenca,
      });

      if (!saved) throw "Erro ao salvar lançamento!";

      return ok({ message: "Salvo com sucesso" });
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }

  private calcularDiferencaMinutos(entrada: Date, saida: Date): number {
    const diferencaMs = saida.getTime() - entrada.getTime();
    // Convertendo a diferença de milissegundos para minutos arredondando para cima
    const diferencaMinutos = Math.ceil(diferencaMs / (1000 * 60));
    return diferencaMinutos;
  }
}
