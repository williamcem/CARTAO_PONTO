import { RecalcularTurnoPostgresRepository } from "@infra/db/postgresdb/recalcular-turno/recalcular-turno";
import { FuncionarioImpressaoCalculoPostgresRepository } from "../../infra/db/postgresdb/get-funcionario-impressao-calculo/get-funcionario-impressao-calculo";
import { GetFuncionarioImpressaoCalculoController } from "../../presentation/controllers/get-funcionário-impressao-calculo/procurar-funcionário-impressao-calculo";
import { RecalcularTurnoController } from "../../presentation/controllers/recalcular-turno/recalcular-turno";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeGetFuncionarioImpressaoCalculoController = (): Controller => {
  const funcionarioImpressaoCalculoPostgresRepository = new FuncionarioImpressaoCalculoPostgresRepository();
  const recalcularTurnoPostgresRepository = new RecalcularTurnoPostgresRepository();
  const recalcularTurnoController = new RecalcularTurnoController(recalcularTurnoPostgresRepository);
  const getFuncionarioImpressaoCalculoController = new GetFuncionarioImpressaoCalculoController(
    funcionarioImpressaoCalculoPostgresRepository,
    recalcularTurnoController,
  );

  return new LogControllerDecorator(getFuncionarioImpressaoCalculoController);
};
