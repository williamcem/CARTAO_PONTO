import { OcorrenciaPostgresRepository } from "../../infra/db/postgresdb/listar-ocorrencias/listar-ocorrencias-repository";
import { LogControllerDecorator } from "../decorators/log";
import { Controller } from "../../presentation/protocols";
import { OcorrenciaController } from "../../presentation/controllers/listar-ocorrencia/listar-ocorrencia-controler";
import { GetFuncionarioController } from "../../presentation/controllers/procurar-funcionário/procurar-funcionário";
import { FuncionarioPostgresRepository } from "@infra/db/postgresdb/get-funcionario/get-funcionario";

export const makeListarOcorrenciasController = (): Controller => {
  const ocorrenciaPostgresRepository = new OcorrenciaPostgresRepository();
  const funcionarioPostgresRepository = new FuncionarioPostgresRepository();
  const getFuncionarioController = new GetFuncionarioController(funcionarioPostgresRepository);
  const ocorrenciaController = new OcorrenciaController(ocorrenciaPostgresRepository, getFuncionarioController);
  return new LogControllerDecorator(ocorrenciaController);
};
