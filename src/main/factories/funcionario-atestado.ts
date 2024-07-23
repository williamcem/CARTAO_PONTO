import { FuncionarioAtestadoPostgresRepository } from "../../infra/db/postgresdb/funcionario-atestado/funcionario-atestado";
import { FuncionarioAtestadoController } from "../../presentation/controllers/funcionário-atestado/procurar-funcionário";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeGetFuncionarioAtestadoController = (): Controller => {
  const funcionarioAtestadoPostgresRepository = new FuncionarioAtestadoPostgresRepository();
  const funcionarioAtestadoController = new FuncionarioAtestadoController(funcionarioAtestadoPostgresRepository);
  return new LogControllerDecorator(funcionarioAtestadoController);
};
