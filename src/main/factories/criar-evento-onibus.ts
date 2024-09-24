import { CriarEventoOnibusPostgresRepository } from "@infra/db/postgresdb/evento-onibus/evento-onibus-repository";
import { RecalcularTurnoPostgresRepository } from "@infra/db/postgresdb/recalcular-turno/recalcular-turno";

import { CriarEventoOnibusController } from "../../presentation/controllers/evento-onibus/evento-onibus-controller";
import { RecalcularTurnoController } from "../../presentation/controllers/recalcular-turno/recalcular-turno";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeCriarEventoOnibusController = (): Controller => {
  const recalcularTurnoPostgresRepository = new RecalcularTurnoPostgresRepository();
  const recalcularTurnoController = new RecalcularTurnoController(recalcularTurnoPostgresRepository);
  const criarEventoOnibusPostgresRepository = new CriarEventoOnibusPostgresRepository(recalcularTurnoController);
  const criarEventoOnibusController = new CriarEventoOnibusController(criarEventoOnibusPostgresRepository);
  return new LogControllerDecorator(criarEventoOnibusController);
};
