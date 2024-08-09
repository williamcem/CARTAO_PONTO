import { CalcularResumoPostgresRepository } from "@infra/db/postgresdb/calcular-resumo/calcular-resumo-repository";
import { ResumoModel } from "@domain/models/calcular-resumo";
import { OcorrenciaPostgresRepository } from "../../../infra/db/postgresdb/listar-ocorrencias/listar-ocorrencias-repository";
import { FuncionarioParamError, OcorrenciasNull } from "../../errors/Funcionario-param-error";
import { badRequest, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "./listar-ocorrencia-protocols";

export class OcorrenciaController implements Controller {
  constructor(
    private readonly ocorrenciaPostgresRepository: OcorrenciaPostgresRepository,
    private readonly calcularResumoPostgresRepository: CalcularResumoPostgresRepository,
  ) {}

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

      let output: any[] = [];

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
          eventos: [],
        });
      }

      const eventos: any = [];

      output.map((funcionario) =>
        funcionario.dias.map((dia: any) => {
          dia.eventos.map((evento: any) => {
            if (evento.tipoId == 8) eventos.push({ ...evento, ...{ data: dia.data } });
          });
        }),
      );

      output.map((funcionario) =>
        funcionario.dias.map((dia: any) => {
          dia.eventos.map((evento: any) => {
            if (evento.tipoId != 8) eventos.push({ ...evento, ...{ data: dia.data } });
          });
        }),
      );

      if (output.length == 0) return notFoundRequest(new FuncionarioParamError("Não há ocorrências para essa identificação"));

      output = [{ eventos }];

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
