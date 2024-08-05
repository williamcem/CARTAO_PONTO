import { CalcularResumoPostgresRepository } from "@infra/db/postgresdb/calcular-resumo/calcular-resumo-repository";

import { OcorrenciaSolucionadasPostgresRepository } from "../../infra/db/postgresdb/listar-ocorrencias-solucionadas/listar-ocorrencias-solucionadas-repository";
import { OcorrenciaSolucionadasController } from "../../presentation/controllers/listar-ocorrencia-solucionadas/listar-ocorrencia-controler-solucionadas";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeListarOcorrenciasSolucionadasController = (): Controller => {
  const calcularResumoPostgresRepository = new CalcularResumoPostgresRepository();
  const ocorrenciaSolucionadasPostgresRepository = new OcorrenciaSolucionadasPostgresRepository(calcularResumoPostgresRepository);
  const ocorrenciaSolucionadasController = new OcorrenciaSolucionadasController(
    ocorrenciaSolucionadasPostgresRepository,
    calcularResumoPostgresRepository,
  );
  return new LogControllerDecorator(ocorrenciaSolucionadasController);
};
