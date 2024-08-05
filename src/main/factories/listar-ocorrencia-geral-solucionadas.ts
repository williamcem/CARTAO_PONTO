import { OcorrenciaGeralSolucionadaPostgresRepository } from "../../infra/db/postgresdb/listar-ocorrencias-geral-solucionadas/listar-ocorrencias-geral-solucionadas-repository";
import { OcorrenciaGeralSolucionadaController } from "../../presentation/controllers/listar-ocorrencia-geral-solucionadas/listar-ocorrencia-geral-solucionadas-controler";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeListarOcorrenciaGeralSolucionadasController = (): Controller => {
  const ocorrenciaGeralSolucionadaPostgresRepository = new OcorrenciaGeralSolucionadaPostgresRepository();
  const ocorrenciaGeralSolucionadaController = new OcorrenciaGeralSolucionadaController(
    ocorrenciaGeralSolucionadaPostgresRepository,
  );
  return new LogControllerDecorator(ocorrenciaGeralSolucionadaController);
};
