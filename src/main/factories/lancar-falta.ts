import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { ListarTurnoPostgresRepository } from "@infra/db/postgresdb/listar-turno/listar-turno";
import { LancarFaltaController } from "../../presentation/controllers/lancar-falta/lancar-falta";

export const makeLancarFaltaController = (): Controller => {
  const listarTurnoPostgresRepository = new ListarTurnoPostgresRepository();
  const lancarFaltaController = new LancarFaltaController(listarTurnoPostgresRepository);
  return new LogControllerDecorator(lancarFaltaController);
};
