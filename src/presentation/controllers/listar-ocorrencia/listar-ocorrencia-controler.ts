import { OcorrenciaPostgresRepository } from "../../../infra/db/postgresdb/listar-ocorrencias/listar-ocorrencias-repository";
import { FuncionarioParamError } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./listar-ocorrencias-protocols";

export class OcorrenciaController implements Controller {
  constructor(private readonly ocorrenciaPostgresRepository: OcorrenciaPostgresRepository) {}

  async handle(httRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { identificacao, localidade } = httRequest?.query;

      if (!localidade) {
        return badRequest(new FuncionarioParamError("Localidade não fornecida"));
      }
      if (!identificacao) {
        return badRequest(new FuncionarioParamError("Identificação não fornecida"));
      }

      const data = await this.ocorrenciaPostgresRepository.find(identificacao, localidade);

      if (data.funcionarios.length === 0) {
        return notFoundRequest(new Error("Nenhum funcionário encontrado"));
      }

      const output: {
        identificacao: string;
        nome: string;
        dias: {
          data: Date;
          eventos: any[];
          lancamentos: {
            periodoId: number;
            entrada: Date | null;
            saida: Date | null;
          }[];
        }[];
        resumo: string;
      }[] = [];

      data.funcionarios.map((funcionario) => {
        if (funcionario.dias.length === 0) return undefined;

        output.push({
          nome: funcionario.nome,
          identificacao: funcionario.identificacao,
          dias: funcionario.dias.map((dia) => ({
            data: dia.data,
            eventos: dia.eventos,
            lancamentos: dia.lancamentos,
          })),
          resumo: "aguarde", // Placeholder for any additional data
        });

        return undefined;
      });

      return ok(output);
    } catch (error) {
      console.error(error);
      return serverError();
    }
  }
}
