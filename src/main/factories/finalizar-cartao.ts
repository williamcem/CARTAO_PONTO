import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { FinalizarCartaoController } from "../../presentation/controllers/finalizar-cartao/finalizar-cartao";
import { FinalizarCartaoPostgresRepository } from "@infra/db/postgresdb/finalizar-cartao/finalizar-cartao";
import { GetFuncionarioImpressaoCalculoController } from "../../presentation/controllers/get-funcionário-impressao-calculo/procurar-funcionário-impressao-calculo";
import { FuncionarioImpressaoCalculoPostgresRepository } from "@infra/db/postgresdb/get-funcionario-impressao-calculo/get-funcionario-impressao-calculo";

export const makeFinalizarCartaoController = (): Controller => {
  const finalizarCartaoPostgresRepository = new FinalizarCartaoPostgresRepository();
  const funcionarioImpressaoCalculoPostgresRepository = new FuncionarioImpressaoCalculoPostgresRepository();
  const getFuncionarioImpressaoCalculoController = new GetFuncionarioImpressaoCalculoController(
    funcionarioImpressaoCalculoPostgresRepository,
  );
  const buscarCidController = new FinalizarCartaoController(
    finalizarCartaoPostgresRepository,
    getFuncionarioImpressaoCalculoController,
  );
  return new LogControllerDecorator(buscarCidController);
};
