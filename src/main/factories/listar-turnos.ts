import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { ListarTurnoController } from "../../presentation/controllers/listar-turnos/listar-turno";
import { ListarTurnoPostgresRepository } from "@infra/db/postgresdb/listar-turno/listar-turno";

export const makeListarTurnosController = (): Controller => {
  const listarTurnoPostgresRepository = new ListarTurnoPostgresRepository();
  const buscarFuncionarioReferenciaLocalidadeAgrupadaController = new ListarTurnoController(listarTurnoPostgresRepository);
  return new LogControllerDecorator(buscarFuncionarioReferenciaLocalidadeAgrupadaController);
};
