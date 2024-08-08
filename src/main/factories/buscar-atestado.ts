import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { BuscarAtestadoController } from "../../presentation/controllers/buscar-atestado/buscar-atestado";
import { BuscarAtestadoPostgresRepository } from "@infra/db/postgresdb/buscar-atestado/buscar-atestado";

export const makeBuscarAtestadoController = (): Controller => {
  const buscarAtestadoPostgresRepository = new BuscarAtestadoPostgresRepository();
  const buscarAtestadoController = new BuscarAtestadoController(buscarAtestadoPostgresRepository);
  return new LogControllerDecorator(buscarAtestadoController);
};
