import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { LogarController } from "../../presentation/controllers/logar/logar-controler";
import { LogarPostgresRepository } from "@infra/db/postgresdb/logar/logar-repository";

export const makeCriarUsuarioController = (): Controller => {
  const logarPostgresRepository = new LogarPostgresRepository();
  const logarController = new LogarController(logarPostgresRepository);
  return new LogControllerDecorator(logarController);
};
