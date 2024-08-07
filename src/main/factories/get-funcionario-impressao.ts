import { FuncionarioImpressaoPostgresRepository } from "../../infra/db/postgresdb/get-funcionario-impressao/get-funcionario-impressao";
import { GetFuncionarioImpressaoController } from "../../presentation/controllers/get-funcionário-impressao/get-funcionario-impressao";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeGetFuncionarioImpressaoController = (): Controller => {
  const funcionarioImpressaoPostgresRepository = new FuncionarioImpressaoPostgresRepository();
  const getFuncionarioImpressaoController = new GetFuncionarioImpressaoController(funcionarioImpressaoPostgresRepository);
  return new LogControllerDecorator(getFuncionarioImpressaoController);
};
