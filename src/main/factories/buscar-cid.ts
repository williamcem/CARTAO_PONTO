import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { BuscarCidController } from "../../presentation/controllers/buscar-cid/buscar-cid";
import { BuscarCidPostgresRepository } from "@infra/db/postgresdb/buscar-cid/buscar-cid";

export const makeBuscarCidController = (): Controller => {
  const buscarCidPostgresRepository = new BuscarCidPostgresRepository();
  const buscarCidController = new BuscarCidController(buscarCidPostgresRepository);
  return new LogControllerDecorator(buscarCidController);
};
