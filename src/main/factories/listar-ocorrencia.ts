import { CalcularResumoPostgresRepository } from "@infra/db/postgresdb/calcular-resumo/calcular-resumo-repository";
import { OcorrenciaPostgresRepository } from "../../infra/db/postgresdb/listar-ocorrencias/listar-ocorrencias-repository";
import { OcorrenciaController } from "../../presentation/controllers/listar-ocorrencia/listar-ocorrencia-controler";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeListarOcorrenciasController = (): Controller => {
  const ocorrenciaPostgresRepository = new OcorrenciaPostgresRepository();
  const calcularResumoPostgresRepository = new CalcularResumoPostgresRepository();
  const ocorrenciaController = new OcorrenciaController(ocorrenciaPostgresRepository, calcularResumoPostgresRepository);
  return new LogControllerDecorator(ocorrenciaController);
};
