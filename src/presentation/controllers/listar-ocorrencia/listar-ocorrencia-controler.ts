import { CalcularResumoPostgresRepository } from "@infra/db/postgresdb/calcular-resumo/calcular-resumo-repository";
import { ResumoModel } from "@domain/models/calcular-resumo";
import { OcorrenciaPostgresRepository } from "../../../infra/db/postgresdb/listar-ocorrencias/listar-ocorrencias-repository";
import { FuncionarioParamError, OcorrenciasNull } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./listar-ocorrencia-protocols";
import moment from "moment";

export class OcorrenciaController implements Controller {
  constructor(private readonly ocorrenciaPostgresRepository: OcorrenciaPostgresRepository) {}

  async handle(httRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { identificacao, localidade, referencia } = httRequest?.query;

      if (!localidade) return badRequest(new FuncionarioParamError("Localidade não fornecida"));

      if (!identificacao) return badRequest(new FuncionarioParamError("Identificação não fornecida"));

      if (!referencia) return badRequest(new FuncionarioParamError("Referência não fornecida"));

      const data = await this.ocorrenciaPostgresRepository.find(identificacao, localidade, referencia);

      if (data.funcionarios.length === 0) return notFoundRequest(new Error("Nenhum funcionário encontrado"));

      let output: {
        id: number;
        identificacao: string;
        nome: string;
        nomeTurno: string;
        codigoLocalidade: string;
        referencia: Date | null;
        dias: {
          data: Date;
          eventos: {
            id: number;
            cartaoDiaId: number;
            hora: string;
            funcionarioId: number;
            minutos: number;
            tipoId: number | null;
            tratado: boolean;
            atestadoFuncionarioId: number | null;
            atestado?: {
              id: number;
              statusId: number;
            };
          }[];
          lancamentos: {
            periodoId: number;
            entrada: Date | null;
            saida: Date | null;
          }[];
        }[];
        eventos: {
          id: number;
          cartaoDiaId: number;
          hora: string;
          funcionarioId: number;
          minutos: number;
          tipoId: number | null;
          tratado: boolean;
          atestadoFuncionarioId: number | null;
          atestado?: {
            id: number;
            statusId: number;
          };
        }[];
      }[] = [];

      for (const funcionario of data.funcionarios) {
        if (funcionario.dias.length === 0) continue;

        output.push({
          id: funcionario.id,
          identificacao: funcionario.identificacao,
          nome: funcionario.nome,
          nomeTurno: funcionario.turno?.nome ?? "",
          codigoLocalidade: funcionario.localidade?.codigo ?? "",
          referencia: funcionario.referencia,
          dias: funcionario.dias.map((dia) => ({
            data: dia.data,
            eventos: dia.eventos.map((evento) => {
              const atestado = evento.atestado_funcionario
                ? {
                    id: evento.atestado_funcionario?.id,
                    statusId: evento.atestado_funcionario?.statusId,
                  }
                : undefined;

              return {
                ...{
                  atestado,
                  cartaoDiaId: evento.cartaoDiaId,
                  funcionarioId: evento.funcionarioId,
                  hora: evento.hora,
                  id: evento.id,
                  minutos: evento.minutos,
                  tipoId: evento.tipoId,
                  tratado: evento.tratado,
                },
              };
            }),
            lancamentos: dia.lancamentos,
          })),
          eventos: [],
        });
      }

      const eventos: {
        id: number;
        cartaoDiaId: number;
        hora: string;
        funcionarioId: number;
        minutos: number;
        tipoId: number | null;
        tratado: boolean;
        atestadoFuncionarioId: number | null;
        atestado?: {
          id: number;
          statusId: number;
        };
      }[] = [];

      output.map((funcionario) =>
        funcionario.dias.map((dia: any) => {
          dia.eventos.map((evento: any) => {
            if (evento.tipoId == 8) eventos.push({ ...evento, ...{ data: dia.data } });
          });
        }),
      );

      for (const funcionario of output) {
        for (const dia of funcionario.dias) {
          for (const evento of dia.eventos) {
            if (evento.tipoId != 8) {
              let hora = evento.hora;
              let analise = false;

              const lte = moment.utc(dia.data).add(4, "hours").toDate();
              const gte = moment.utc(dia.data).subtract(4, "hours").toDate();

              const existeAtestadoPendente = await this.ocorrenciaPostgresRepository.findFirstAtestado({
                data: { gte, lte },
                funcionarioId: funcionario.id,
                statusId: 1,
              });

              //Verificar se irá remover
              if (existeAtestadoPendente) {
                hora = "EM ANÁLISE";
                analise = true;
              }

              eventos.push({ ...evento, ...{ data: dia.data, hora, analise } });
            }
          }
        }
      }

      if (output.length == 0) return notFoundRequest(new FuncionarioParamError("Não há ocorrências para essa identificação"));

      const novoOutput = [{ eventos }];

      return ok(novoOutput);
    } catch (error) {
      if (error instanceof OcorrenciasNull) {
        return badRequest(new FuncionarioParamError(error.message));
      }
      console.error(error);
      return serverError();
    }
  }
}
