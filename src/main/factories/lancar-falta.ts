import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { LancarFaltaController } from "../../presentation/controllers/lancar-falta/lancar-falta";
import { LancarFaltaPostgresRepository } from "@infra/db/postgresdb/lancar-falta/lancar-falta";
import { CriarEventosPostgresRepository } from "@infra/db/postgresdb/eventos/eventos-repository";

export const makeLancarFaltaController = (): Controller => {
  const lancarFaltaPostgresRepository = new LancarFaltaPostgresRepository();
  const criarEventosPostgresRepository = new CriarEventosPostgresRepository();
  const lancarFaltaController = new LancarFaltaController(lancarFaltaPostgresRepository, criarEventosPostgresRepository);
  return new LogControllerDecorator(lancarFaltaController);
};
