import { CalcularResumoPostgresRepository } from "@infra/db/postgresdb/calcular-resumo/calcular-resumo-repository";

import { OcorrenciaSolucionadasPostgresRepository } from "../../../infra/db/postgresdb/listar-ocorrencias-solucionadas/listar-ocorrencias-solucionadas-repository";
import { FuncionarioParamError, OcorrenciasNull } from "../../errors/Funcionario-param-error";
import { badRequest, badRequestNovo, notFoundRequest, ok, serverError } from "../../helpers/http-helpers";
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
      const { identificacao, localidade, referencia } = httRequest?.query;

      if (!localidade) return badRequestNovo({ message: "Localidade não fornecida" });

      if (!identificacao) return badRequestNovo({ message: "Identificação não fornecida" });

      if (!referencia) return badRequestNovo({ message: "Referência não fornecida" });

      const funcionario = await this.ocorrenciaSolucionadasPostgresRepository.findFisrtFuncionario(identificacao, localidade);
      if (!funcionario) return badRequestNovo(new FuncionarioParamError("Referência não fornecida"));

      const output: {
        data: Date;
        hora: string;
        minutos: number;
        solucao: string;
        id:number
      }[] = [];

      const eventos = await this.ocorrenciaSolucionadasPostgresRepository.findManyEvento({
        funcionarioId: funcionario.id,
        referencia,
        tipo: { notIn: [1, 8] },
      });

      eventos.map((evento) => {
        output.push({
          data: evento.cartao_dia?.data || new Date(),
          hora: evento.hora,
          minutos: evento.minutos,
          solucao: evento.tipo_eventos?.nome || "",
          id:evento.id
        });
      });

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
