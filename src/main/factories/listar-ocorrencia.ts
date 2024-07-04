import { OcorrenciaPostgresRepository } from "../../infra/db/postgresdb/listar-ocorrencias/listar-ocorrencias-repository";
import { OcorrenciaController } from "../../presentation/controllers/listar-ocorrencia/listar-ocorrencia-controler";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeListarOcorrenciasController = (): Controller => {
  const ocorrenciaPostgresRepository = new OcorrenciaPostgresRepository();
  const ocorrenciaController = new OcorrenciaController(ocorrenciaPostgresRepository);
  return new LogControllerDecorator(ocorrenciaController);
};
