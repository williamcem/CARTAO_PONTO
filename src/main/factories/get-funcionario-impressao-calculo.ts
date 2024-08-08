import { FuncionarioImpressaoCalculoPostgresRepository } from "../../infra/db/postgresdb/get-funcionario-impressao-calculo/get-funcionario-impressao-calculo";
import { GetFuncionarioImpressaoCalculoController } from "../../presentation/controllers/get-funcionário-impressao-calculo/procurar-funcionário-impressao-calculo";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeGetFuncionarioImpressaoCalculoController = (): Controller => {
  const funcionarioImpressaoCalculoPostgresRepository = new FuncionarioImpressaoCalculoPostgresRepository();
  const getFuncionarioImpressaoCalculoController = new GetFuncionarioImpressaoCalculoController(
    funcionarioImpressaoCalculoPostgresRepository,
  );

  return new LogControllerDecorator(getFuncionarioImpressaoCalculoController);
};
