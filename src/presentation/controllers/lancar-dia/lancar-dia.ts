import { LancarDiaPostgresRepository } from "@infra/db/postgresdb/lancar-dia/lancar-dia";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./lancar-dia-protocols";

export class LancarDiaController implements Controller {
  constructor(private readonly lancarDiaPostgresRepository: LancarDiaPostgresRepository) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { periodoId, entrada, saida, cartao_dia_id, userName } = httpRequest?.body;

      if (!periodoId) return badRequest(new FuncionarioParamError("Falta id do periodo!"));
      if (!cartao_dia_id) return badRequest(new FuncionarioParamError("Falta sequencia do cartão!"));
      if (!userName) return badRequest(new FuncionarioParamError("Falta usuário para lançar cartão"));

      let entradaDate: Date | undefined = undefined;
      let saidaDate: Date | undefined = undefined;

      if (entrada) {
        entradaDate = new Date(entrada);
        if (isNaN(entradaDate.getTime())) {
          return badRequest(new FuncionarioParamError("Formato de data de entrada inválido!"));
        }
      }

      if (saida) {
        saidaDate = new Date(saida);
        if (isNaN(saidaDate.getTime())) {
          return badRequest(new FuncionarioParamError("Formato de data de saída inválido!"));
        }
      }

      // Verificar a data do cartao_dia e cartao_dia_lancamentos
      const cartaoDia = await this.lancarDiaPostgresRepository.findCartaoDiaById(cartao_dia_id);
      if (!cartaoDia) {
        return badRequest(new FuncionarioParamError("Cartão do dia não encontrado!"));
      }

      const cartaoDiaDate = new Date(cartaoDia.data);

      if (entradaDate && entradaDate < cartaoDiaDate) {
        return badRequest(new FuncionarioParamError("Data de entrada divergente entre o cartão do dia e o lançamento!"));
      }

      if (saidaDate && saidaDate < cartaoDiaDate) {
        return badRequest(new FuncionarioParamError("Data de saída divergente entre o cartão do dia e o lançamento!"));
      }

      // Verificar se há conflitos de períodos
      if (entradaDate && saidaDate) {
        const conflictingPeriodos = await this.lancarDiaPostgresRepository.findConflictingPeriodos(
          entradaDate,
          saidaDate,
          cartao_dia_id,
          periodoId,
        );
        if (conflictingPeriodos.length > 0) {
          return badRequest(new FuncionarioParamError("Período já existente!"));
        }
      }

      // Calculando a diferença em minutos entre entrada e saída
      let diferenca = 0;
      if (entradaDate && saidaDate) {
        diferenca = this.calcularDiferencaMinutos(entradaDate, saidaDate);
      }

      const saved = await this.lancarDiaPostgresRepository.upsert({
        cartao_dia_id,
        entrada: entradaDate ? entradaDate : undefined,
        periodoId,
        saida: saidaDate ? saidaDate : undefined,
        statusId: 1,
        diferenca,
        userName,
      });

      if (!saved) {
        return badRequest(
          new FuncionarioParamError(
            "Lançamento já existente para este período. Em caso de erro de digitação, limpe a linha e tente novamente.",
          ),
        );
      }

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
