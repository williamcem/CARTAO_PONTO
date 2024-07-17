import { CriarEventosPostgresRepository } from "@infra/db/postgresdb/eventos/eventos-repository";

import { CriarEventosController } from "../../presentation/controllers/eventos/eventos-controller";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeCriarEventosController = (): Controller => {
  const criarEventosPostgresRepository = new CriarEventosPostgresRepository();
  const criarEventosController = new CriarEventosController(criarEventosPostgresRepository);
  return new LogControllerDecorator(criarEventosController);
};
