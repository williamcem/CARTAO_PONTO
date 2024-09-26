import { OcorrenciaGeralPostgresRepository } from "../../../infra/db/postgresdb/listar-ocorrencias-geral/listar-ocorrencias-repository";
import { FuncionarioParamError, OcorrenciasNull } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./listar-ocorrencias-protocols";

export class OcorrenciaGeralController implements Controller {
  constructor(private readonly ocorrenciaGeralPostgresRepository: OcorrenciaGeralPostgresRepository) {}

  async handle(httRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { localidade, referencia } = httRequest?.query;

      if (!localidade) {
        return badRequest(new Error("Localidade não informada"));
      }

      if (!referencia) {
        return badRequest(new Error("Referência não informada"));
      }

      const data = await this.ocorrenciaGeralPostgresRepository.findOcorrencia(localidade, referencia);

      const funcionarios: {
        id: number;
        identificacao: string;
        nome: string;
        eventosNaoTratados: { id: number; tratado: boolean }[];
      }[] = [];

      data.map((funcionario) => {
        funcionario.cartao.map((cartao) => {
          cartao.cartao_dia.map((dia) => {
            let adicionar = false;
            let eventosNaoTratados: { id: number; tratado: boolean }[] = [];

            // Verifica se existem lançamentos não validados
            if (dia.cartao_dia_lancamentos.length !== 0) {
              const naoValidado = dia.cartao_dia_lancamentos.find(
                (lancamento) => lancamento.cartao_dia_id === dia.id && !lancamento.validadoPeloOperador,
              );

              if (naoValidado) return;
            }

            const ocorrencia = dia.eventos.find((evento) => evento.tipoId === 2);

            if (ocorrencia) {
              adicionar = true;
            }

            // Se não houver ocorrencia de tipoId === 2, verifica os eventos de tipoId === 8
            if (!adicionar) {
              const intervalos = dia.eventos.filter((evento) => evento.tipoId === 8);

              // Verifica se existem exatamente 2 eventos de tipoId === 8
              if (intervalos.length <= 2) {
                // Filtra os eventos que têm tratado como false
                eventosNaoTratados = intervalos
                  .filter((evento) => evento.tratado === false)
                  .map((evento) => ({
                    id: evento.cartaoDiaId,
                    tratado: evento.tratado,
                  }));

                if (eventosNaoTratados.length > 0) {
                  adicionar = true;
                }
              }
            }

            // Adiciona o funcionário à lista se atender às condições
            if (adicionar) {
              const existeIndexFuncionario = funcionarios.findIndex((func) => funcionario.id === func.id);

              if (existeIndexFuncionario === -1) {
                funcionarios.push({
                  id: funcionario.id,
                  identificacao: funcionario.identificacao,
                  nome: funcionario.nome,
                  eventosNaoTratados,
                });
              } else {
              }
            }
          });
        });
      });

      return ok(funcionarios);
    } catch (error) {
      console.error("Erro durante o processamento:", error);
      if (error instanceof OcorrenciasNull) {
        return badRequest(new FuncionarioParamError(error.message));
      }
      return serverError();
    }
  }
}
