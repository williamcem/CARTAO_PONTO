import { CriarEventosPostgresRepository } from "@infra/db/postgresdb/eventos/eventos-repository";

import { CriarEventosController } from "../../presentation/controllers/eventos/eventos-controller";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { RecalcularTurnoController } from "../../presentation/controllers/recalcular-turno/recalcular-turno";
import { RecalcularTurnoPostgresRepository } from "@infra/db/postgresdb/recalcular-turno/recalcular-turno";
import { CompensacaoEventoRepository } from "@infra/db/postgresdb/compensacao-eventos-automaticos-repository/compensacao-eventos-automaticos-repository";

export const makeCriarEventosController = (): Controller => {
  const recalcularTurnoPostgresRepository = new RecalcularTurnoPostgresRepository();
  const recalcularTurnoController = new RecalcularTurnoController(recalcularTurnoPostgresRepository);
  const compensacaoEventoRepository = new CompensacaoEventoRepository();
  const criarEventosPostgresRepository = new CriarEventosPostgresRepository(
    recalcularTurnoController,
    compensacaoEventoRepository,
  );
  const criarEventosController = new CriarEventosController(criarEventosPostgresRepository);
  return new LogControllerDecorator(criarEventosController);
};
