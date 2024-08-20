import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { BuscarAlteracaoTurnoController } from "../../presentation/controllers/buscar-alteracao-turno/buscar-alteracao-turno";
import { BuscarAlteracaoTurnoPostgresRepository } from "@infra/db/postgresdb/buscar-alteracao-turno/buscarta-alteracao-turno";

export const makeAlteracaoTurnoController = (): Controller => {
  const buscarAlteracaoTurnoPostgresRepository = new BuscarAlteracaoTurnoPostgresRepository();
  const lancarFaltaController = new BuscarAlteracaoTurnoController(buscarAlteracaoTurnoPostgresRepository);
  return new LogControllerDecorator(lancarFaltaController);
};
