import { FuncionarioPostgresRepository } from "../../infra/db/postgresdb/get-funcionario/get-funcionario";
import { LogControllerDecorator } from "../decorators/log";
import { Controller } from "../../presentation/protocols";
import { GetFuncionarioController } from "../../presentation/controllers/procurar-funcionário/procurar-funcionário";

export const makeGetFuncionarioController = (): Controller => {
  const funcionarioPostgresRepository = new FuncionarioPostgresRepository();
  const getFuncionarioController = new GetFuncionarioController(funcionarioPostgresRepository);
  return new LogControllerDecorator(getFuncionarioController);
};
