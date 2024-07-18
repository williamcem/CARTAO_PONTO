import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { RespaldarController } from "../../presentation/controllers/respaldar-atestado/respaldar-atestado";
import { RespaldarAtestadoPostgresRepository } from "@infra/db/postgresdb/respaldar-atestado/respaldar-atestado";

export const makeRespaldarAtestadoController = (): Controller => {
  const respaldarAtestadoPostgresRepository = new RespaldarAtestadoPostgresRepository();
  const respaldarController = new RespaldarController(respaldarAtestadoPostgresRepository);
  return new LogControllerDecorator(respaldarController);
};
