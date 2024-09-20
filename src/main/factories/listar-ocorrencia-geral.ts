import { BuscarOcorrenciaMinutoAusentePostgresRepository } from "@infra/db/postgresdb/buscar-ocorrencia-minuto-ausente/buscar-ocorrencia-minuto-ausente";
import { OcorrenciaGeralPostgresRepository } from "../../infra/db/postgresdb/listar-ocorrencias-geral/listar-ocorrencias-repository";
import { BuscarOcorrenciaMinutoAusenteController } from "../../presentation/controllers/buscar-ocorrencia-minuto-ausente/buscar-ocorrencia-minuto-ausente";
import { OcorrenciaGeralController } from "../../presentation/controllers/listar-ocorrencia-geral/listar-ocorrencia-geral-controler";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { CriarEventosPostgresRepository } from "@infra/db/postgresdb/eventos/eventos-repository";
import { RecalcularTurnoController } from "../../presentation/controllers/recalcular-turno/recalcular-turno";
import { RecalcularTurnoPostgresRepository } from "@infra/db/postgresdb/recalcular-turno/recalcular-turno";

export const makeListarOcorrenciaGeralController = (): Controller => {
  const ocorrenciaGeralPostgresRepository = new OcorrenciaGeralPostgresRepository();
  const buscarOcorrenciaMinutoAusentePostgresRepository = new BuscarOcorrenciaMinutoAusentePostgresRepository();
  const recalcularTurnoPostgresRepository = new RecalcularTurnoPostgresRepository();
  const recalcularTurnoController = new RecalcularTurnoController(recalcularTurnoPostgresRepository);
  const criarEventosPostgresRepository = new CriarEventosPostgresRepository(recalcularTurnoController);

  const buscarOcorrenciaMinutoAusenteController = new BuscarOcorrenciaMinutoAusenteController(
    buscarOcorrenciaMinutoAusentePostgresRepository,
    criarEventosPostgresRepository,
  );
  const ocorrenciaGeralController = new OcorrenciaGeralController(
    ocorrenciaGeralPostgresRepository,
    buscarOcorrenciaMinutoAusenteController,
  );
  return new LogControllerDecorator(ocorrenciaGeralController);
};
