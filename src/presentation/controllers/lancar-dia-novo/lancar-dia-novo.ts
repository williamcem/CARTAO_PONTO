import moment from "moment";

import { CriarEventosPostgresRepository } from "@infra/db/postgresdb/eventos/eventos-repository";
import { LancarDiaPostgresRepositoryNovo } from "@infra/db/postgresdb/lancar-dia-novo/lancar-dia-novo";
import { LancarFaltaPostgresRepository } from "@infra/db/postgresdb/lancar-falta/lancar-falta";

import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, ok, serverError } from "../../helpers/http-helpers";
import { LancarFaltaController } from "../lancar-falta/lancar-falta";
import { RecalcularTurnoController } from "../recalcular-turno/recalcular-turno";
import { Controller, HttpRequest, HttpResponse } from "./lancar-dia-protocols";

export class LancarDiaControllerNovo implements Controller {
  constructor(
    private readonly lancarDiaPostgresRepository: LancarDiaPostgresRepositoryNovo,
    private readonly criarEventosPostgresRepository: CriarEventosPostgresRepository,
    private readonly lancarFaltaPostgresRepository: LancarFaltaPostgresRepository,
    private readonly recalcularTurnoController: RecalcularTurnoController,
  ) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { cartao_dia_id, userName, lancamentos } = httpRequest?.body;

      // Validações de parâmetros obrigatórios
      if (!cartao_dia_id) return badRequest(new FuncionarioParamError("Falta sequencia do cartão!"));
      if (!userName) return badRequest(new FuncionarioParamError("Falta usuário para lançar cartão"));
      // Verificar se pode enviar tudo vazio
      /*       if (!lancamentos || !Array.isArray(lancamentos) || lancamentos.length === 0) {
        return badRequest(new FuncionarioParamError("Falta lista de lançamentos!"));
      } */

      const finalizado = await this.lancarDiaPostgresRepository.isCartaoFinalizado(cartao_dia_id);
      if (finalizado) {
        return badRequest(new FuncionarioParamError("Impossível fazer novos lançamentos de cartão finalizado"));
      }

      // Verificar a existência do cartão do dia
      const cartaoDia = await this.lancarDiaPostgresRepository.findCartaoDiaById(cartao_dia_id);
      if (!cartaoDia) return badRequest(new FuncionarioParamError("Cartão do dia não encontrado!"));

      const cartaoDiaDate = new Date(cartaoDia.data);

      for (const lancamento of lancamentos) {
        const { periodoId, entrada, saida } = lancamento;

        if (!periodoId) return badRequest(new FuncionarioParamError("Falta id do periodo!"));

        let entradaDate: Date | undefined = undefined;
        let saidaDate: Date | undefined = undefined;

        if (entrada) {
          entradaDate = new Date(entrada);
          if (isNaN(entradaDate.getTime())) {
            return badRequest(new FuncionarioParamError(`Formato de data de entrada inválido no período ${periodoId}!`));
          }
        }

        if (saida) {
          saidaDate = new Date(saida);
          if (isNaN(saidaDate.getTime())) {
            return badRequest(new FuncionarioParamError(`Formato de data de saída inválido no período ${periodoId}!`));
          }
        }

        const saidaAntesDaEntrada = entrada && saida && moment(entrada).isAfter(saida);
        if (saidaAntesDaEntrada) {
          return badRequest(new FuncionarioParamError(`A saída não pode ser antes da entrada no período ${periodoId}!`));
        }

        if (entradaDate && entradaDate < cartaoDiaDate) {
          return badRequest(new FuncionarioParamError(`Data de entrada divergente no período ${periodoId}!`));
        }

        if (saidaDate && saidaDate < cartaoDiaDate) {
          return badRequest(new FuncionarioParamError(`Data de saída divergente no período ${periodoId}!`));
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
            console.log(`Períodos conflitantes encontrados para o período ${periodoId}:`, conflictingPeriodos);
            return badRequest(new FuncionarioParamError(`Período já existente no período ${periodoId}!`));
          }
        }

        // Realizar o upsert do lançamento
        const saved = await this.lancarDiaPostgresRepository.upsert({
          cartao_dia_id,
          entrada: entradaDate ? entradaDate : undefined,
          periodoId,
          saida: saidaDate ? saidaDate : undefined,
          statusId: 1,
          userName,
        });

        if (!saved) {
          return badRequest(
            new FuncionarioParamError(
              `Lançamento já existente para o período ${periodoId}. Em caso de erro de digitação apague a linha e faça um novo lançamento`,
            ),
          );
        }
      }

      // Após os lançamentos, executar a geração de eventos
      console.log("Iniciando processo de geração de eventos para o cartão:", cartao_dia_id);
      await this.criarEventosPostgresRepository.add({ identificacao: String(cartao_dia_id) });
      console.log("Eventos gerados com sucesso para o cartão:", cartao_dia_id);

      // Chamar o LancarFaltaController para processar as faltas
      const lancarFaltaController = new LancarFaltaController(
        this.lancarFaltaPostgresRepository,
        this.criarEventosPostgresRepository,
        this.recalcularTurnoController,
      );
      const faltaResponse = await lancarFaltaController.handle({ body: { cartaoDiaId: cartao_dia_id } });

      // Verificando se houve sucesso no lançamento da falta
      if (faltaResponse.statusCode !== 200) {
        console.error("Erro ao lançar falta:", faltaResponse.body);
      }

      return ok({ message: "Todos os lançamentos foram salvos com sucesso, eventos e faltas foram processados." });
    } catch (error) {
      console.error("Erro durante o processamento do lançamento:", error);
      return serverError();
    }
  }
}
