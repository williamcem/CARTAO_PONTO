import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { BuscarOcorrenciaMinutoAusenteController } from "../../presentation/controllers/buscar-ocorrencia-minuto-ausente/buscar-ocorrencia-minuto-ausente";
import { BuscarOcorrenciaMinutoAusentePostgresRepository } from "@infra/db/postgresdb/buscar-ocorrencia-minuto-ausente/buscar-ocorrencia-minuto-ausente";
import { CriarEventosPostgresRepository } from "@infra/db/postgresdb/eventos/eventos-repository";
import { RecalcularTurnoController } from "../../presentation/controllers/recalcular-turno/recalcular-turno";
import { RecalcularTurnoPostgresRepository } from "@infra/db/postgresdb/recalcular-turno/recalcular-turno";
import { LancarFaltaController } from "../../presentation/controllers/lancar-falta/lancar-falta";
import { LancarFaltaPostgresRepository } from "@infra/db/postgresdb/lancar-falta/lancar-falta";

export const makeBuscarOcorrenciaMinutoAusenteController = (): Controller => {
  const buscarOcorrenciaMinutoAusentePostgresRepository = new BuscarOcorrenciaMinutoAusentePostgresRepository();
  const recalcularTurnoPostgresRepository = new RecalcularTurnoPostgresRepository();
  const recalcularTurnoController = new RecalcularTurnoController(recalcularTurnoPostgresRepository);
  const criarEventosPostgresRepository = new CriarEventosPostgresRepository(recalcularTurnoController);
  const lancarFaltaPostgresRepository = new LancarFaltaPostgresRepository();

  const lancarFaltaController = new LancarFaltaController(
    lancarFaltaPostgresRepository,
    criarEventosPostgresRepository,
    recalcularTurnoController,
  );
  const buscarOcorrenciaMinutoAusenteController = new BuscarOcorrenciaMinutoAusenteController(
    buscarOcorrenciaMinutoAusentePostgresRepository,
    criarEventosPostgresRepository,
    lancarFaltaController,
  );

  return new LogControllerDecorator(buscarOcorrenciaMinutoAusenteController);
};
