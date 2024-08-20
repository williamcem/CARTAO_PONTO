import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { LancarFaltaController } from "../../presentation/controllers/lancar-falta/lancar-falta";
import { LancarFaltaPostgresRepository } from "@infra/db/postgresdb/lancar-falta/lancar-falta";
import { CriarEventosPostgresRepository } from "@infra/db/postgresdb/eventos/eventos-repository";
import { RecalcularTurnoController } from "../../presentation/controllers/recalcular-turno/recalcular-turno";
import { RecalcularTurnoPostgresRepository } from "@infra/db/postgresdb/recalcular-turno/recalcular-turno";

export const makeLancarFaltaController = (): Controller => {
  const lancarFaltaPostgresRepository = new LancarFaltaPostgresRepository();
  const recalcularTurnoPostgresRepository = new RecalcularTurnoPostgresRepository();
  const recalcularTurnoController = new RecalcularTurnoController(recalcularTurnoPostgresRepository);
  const criarEventosPostgresRepository = new CriarEventosPostgresRepository(recalcularTurnoController);
  const lancarFaltaController = new LancarFaltaController(
    lancarFaltaPostgresRepository,
    criarEventosPostgresRepository,
    recalcularTurnoController,
  );
  return new LogControllerDecorator(lancarFaltaController);
};
