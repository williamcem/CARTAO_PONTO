import { CalcularResumoPostgresRepository } from "@infra/db/postgresdb/calcular-resumo/calcular-resumo-repository";

import { OcorrenciaSolucionadasPostgresRepository } from "../../../infra/db/postgresdb/listar-ocorrencias-solucionadas/listar-ocorrencias-solucionadas-repository";
import { FuncionarioParamError, OcorrenciasNull } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./listar-ocorrencia-protocols";

export class OcorrenciaSolucionadasController implements Controller {
  constructor(
    private readonly ocorrenciaSolucionadasPostgresRepository: OcorrenciaSolucionadasPostgresRepository,
    private readonly calcularResumoPostgresRepository: CalcularResumoPostgresRepository,
  ) {
    this.ocorrenciaSolucionadasPostgresRepository = new OcorrenciaSolucionadasPostgresRepository(
      calcularResumoPostgresRepository,
    );
  }

  async handle(httRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { identificacao, localidade } = httRequest?.query;

      if (!localidade) {
        return badRequest(new FuncionarioParamError("Localidade não fornecida"));
      }
      if (!identificacao) {
        return badRequest(new FuncionarioParamError("Identificação não fornecida"));
      }

      const data = await this.ocorrenciaSolucionadasPostgresRepository.find(identificacao, localidade);

      if (data.funcionarios.length === 0) {
        return notFoundRequest(new Error("Nenhum funcionário encontrado"));
      }

      const output: {
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
            tipoId: number;
            tratado: boolean;
            solucaoDada: string;
          }[];
          lancamentos: {
            periodoId: number;
            entrada: Date | null;
            saida: Date | null;
          }[];
        }[];
        resumo: any;
      }[] = [];

      for (const funcionario of data.funcionarios) {
        if (funcionario.dias.length === 0) continue;

        output.push({
          identificacao: funcionario.identificacao,
          nome: funcionario.nome,
          nomeTurno: funcionario.turno?.nome ?? "",
          codigoLocalidade: funcionario.localidade?.codigo ?? "",
          referencia: funcionario.referencia,
          dias: funcionario.dias.map((dia) => ({
            data: dia.data,
            eventos: dia.eventos,
            lancamentos: dia.lancamentos,
          })),
          resumo: funcionario.Resumo, // Usando o resumo calculado diretamente
        });
      }

      return ok(output);
    } catch (error) {
      if (error instanceof OcorrenciasNull) {
        return badRequest(new FuncionarioParamError(error.message));
      }
      console.error(error);
      return serverError();
    }
  }
}
