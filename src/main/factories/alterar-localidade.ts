import { AlterarLocalidadePostgresRepository } from "@infra/db/postgresdb/alterar-localidade/alterar-localidade";
import { AlterarLocalidadeController } from "../../presentation/controllers/alterar-localidade/alterar-localidade";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { CriarEventosController } from "../../presentation/controllers/eventos/eventos-controller";
import { CriarEventosPostgresRepository } from "@infra/db/postgresdb/eventos/eventos-repository";
import { RecalcularTurnoController } from "../../presentation/controllers/recalcular-turno/recalcular-turno";
import { RecalcularTurnoPostgresRepository } from "@infra/db/postgresdb/recalcular-turno/recalcular-turno";

export const makeAlterarLocalidadeontroller = (): Controller => {
  const alterarLocalidadePostgresRepository = new AlterarLocalidadePostgresRepository();
  const recalcularTurnoPostgresRepository = new RecalcularTurnoPostgresRepository();
  const recalcularTurnoController = new RecalcularTurnoController(recalcularTurnoPostgresRepository);
  const criarEventosPostgresRepository = new CriarEventosPostgresRepository(recalcularTurnoController);
  const criarEventosController = new CriarEventosController(criarEventosPostgresRepository);
  const alterarLocalidadeController = new AlterarLocalidadeController(
    alterarLocalidadePostgresRepository,
    criarEventosController,
  );
  return new LogControllerDecorator(alterarLocalidadeController);
};
