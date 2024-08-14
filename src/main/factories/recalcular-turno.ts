import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { RecalcularTurnoController } from "../../presentation/controllers/recalcular-turno/recalcular-turno";
import { RecalcularTurnoPostgresRepository } from "@infra/db/postgresdb/recalcular-turno/recalcular-turno";

export const makeRecalcularTurnoController = (): Controller => {
  const recalcularTurnoPostgresRepository = new RecalcularTurnoPostgresRepository();
  const lancarFaltaController = new RecalcularTurnoController(recalcularTurnoPostgresRepository);
  return new LogControllerDecorator(lancarFaltaController);
};
