import moment from "moment";

import { CriarEventoOnibusPostgresRepository } from "../../../infra/db/postgresdb/evento-onibus/evento-onibus-repository";
import { badRequestNovo, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./eventos-protocols";

export class CriarEventoOnibusController implements Controller {
  constructor(private readonly criarEventosOnibusPostgresRepository: CriarEventoOnibusPostgresRepository) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    try {
      const { id, entradaReal } = req.body;

      // Validação: Verificar se o id e a entradaReal estão presentes
      if (!entradaReal) {
        return badRequestNovo({ message: "Parâmetro 'entradaReal' é obrigatórios!" });
      }

      if (!id) {
        return badRequestNovo({ message: "Parâmetro 'id' é obrigatórios!" });
      }

      // Validação: Verificar se 'entradaReal' é uma data válida
      if (!moment(entradaReal, moment.ISO_8601, true).isValid()) {
        return badRequestNovo({ message: "Parâmetro 'entradaReal' deve ser uma data válida." });
      }

      // Checagem: Verificar se já existe um evento tipoId: 15 para o cartaoDiaId
      const eventoExistente = await this.criarEventosOnibusPostgresRepository.findEventoByTipoIdAndCartaoDiaId({
        id,
        tipoId: 15, // Verifica se já existe um evento de atraso ônibus (tipoId 15)
      });

      // Se já existir um evento de tipo 15, não criar o evento
      if (eventoExistente) {
        return badRequestNovo({ message: "Já existe atraso ônibus para este dia." });
      }

      // Buscar o lançamento com base no cartaoDiaId
      const lancamento = await this.criarEventosOnibusPostgresRepository.findLancamentoByCartaoDiaId(id);

      // Verificar se o lançamento foi encontrado e se possui uma entrada
      if (!lancamento || !lancamento.entrada) {
        return badRequestNovo({ message: "Lançamento de período '1' não encontrado para o dia fornecido." });
      }

      const entradaLancamentoMoment = moment.utc(lancamento.entrada);
      const entradaRealMoment = moment.utc(entradaReal);

      // Validação: A data de entradaReal não pode ser posterior à data de entrada do banco de dados
      if (entradaRealMoment.isAfter(entradaLancamentoMoment)) {
        return badRequestNovo({ message: "Erro: A entrada real não pode ser posterior à entrada esperada." });
      }

      // Criar o evento no repositório
      const eventoCriado = await this.criarEventosOnibusPostgresRepository.addOnibus({
        id,
        entradaReal: new Date(entradaReal), // Certificar-se de que entradaReal é um Date
      });

      if (!eventoCriado) {
        return badRequestNovo({ message: "Erro ao criar eventos. Verifique os parâmetros fornecidos." });
      }

      return ok({ message: "Evento criado com sucesso" });
    } catch (error) {
      console.error("Erro no processo de criação de eventos:", error);
      return serverError();
    }
  }
}
