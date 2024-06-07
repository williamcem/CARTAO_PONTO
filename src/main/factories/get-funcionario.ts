import { FuncionarioPostgresRepository } from "../../infra/db/postgresdb/get-funcionario/get-funcionario";
import { GetFuncionarioController } from "../../presentation/controllers/procurar-funcionário/procurar-funcionário";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeGetFuncionarioController = (): Controller => {
  const funcionarioPostgresRepository = new FuncionarioPostgresRepository();
  const getFuncionarioController = new GetFuncionarioController(funcionarioPostgresRepository);
  return new LogControllerDecorator(getFuncionarioController);
};
