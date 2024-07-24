import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { LogarController } from "../../presentation/controllers/logar/logar-controler";
import { LogarPostgresRepository } from "@infra/db/postgresdb/logar/logar-repository";

export const makeLogarController = (): Controller => {
  const logarPostgresRepository = new LogarPostgresRepository();
  const criarUsuarioController = new LogarController(logarPostgresRepository);
  return new LogControllerDecorator(criarUsuarioController);
};
