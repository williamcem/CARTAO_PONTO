import { OcorrenciaGeralPostgresRepository } from "../../infra/db/postgresdb/listar-ocorrencias-geral/listar-ocorrencias-repository";
import { OcorrenciaGeralController } from "../../presentation/controllers/listar-ocorrencia-geral/listar-ocorrencia-geral-controler";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeListarOcorrenciaGeralController = (): Controller => {
  const ocorrenciaGeralPostgresRepository = new OcorrenciaGeralPostgresRepository();
  const ocorrenciaGeralController = new OcorrenciaGeralController(ocorrenciaGeralPostgresRepository);
  return new LogControllerDecorator(ocorrenciaGeralController);
};
