import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { BuscarOcorrenciaMinutoAusenteController } from "../../presentation/controllers/buscar-ocorrencia-minuto-ausente/buscar-ocorrencia-minuto-ausente";
import { BuscarOcorrenciaMinutoAusentePostgresRepository } from "@infra/db/postgresdb/buscar-ocorrencia-minuto-ausente/buscar-ocorrencia-minuto-ausente";

export const makeBuscarOcorrenciaMinutoAusenteController = (): Controller => {
  const buscarOcorrenciaMinutoAusentePostgresRepository = new BuscarOcorrenciaMinutoAusentePostgresRepository();
  const buscarOcorrenciaMinutoAusenteController = new BuscarOcorrenciaMinutoAusenteController(
    buscarOcorrenciaMinutoAusentePostgresRepository,
  );

  return new LogControllerDecorator(buscarOcorrenciaMinutoAusenteController);
};
