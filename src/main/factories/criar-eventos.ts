import { CompensacaoEventoRepository } from "@infra/db/postgresdb/compensacao-eventos-automaticos-repository/compensacao-eventos-automaticos-repository";
import { CriarEventosPostgresRepository } from "@infra/db/postgresdb/eventos/eventos-repository";
import { RecalcularTurnoPostgresRepository } from "@infra/db/postgresdb/recalcular-turno/recalcular-turno";

import { CriarEventosController } from "../../presentation/controllers/eventos/eventos-controller";
import { RecalcularTurnoController } from "../../presentation/controllers/recalcular-turno/recalcular-turno";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeCriarEventosController = (): Controller => {
  const recalcularTurnoPostgresRepository = new RecalcularTurnoPostgresRepository();
  const compensacaoEventoRepository = new CompensacaoEventoRepository();
  const recalcularTurnoController = new RecalcularTurnoController(recalcularTurnoPostgresRepository);
  const criarEventosPostgresRepository = new CriarEventosPostgresRepository(
    recalcularTurnoController,
    compensacaoEventoRepository,
  );
  const criarEventosController = new CriarEventosController(criarEventosPostgresRepository);
  return new LogControllerDecorator(criarEventosController);
};
