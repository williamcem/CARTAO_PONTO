import { ConfirmarLancaDiaController } from "../../presentation/controllers/confirmar-lanca-dia/confirmar-lanca-dia";

import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { ConfirmarLancaDiaPostgresRepository } from "@infra/db/postgresdb/confirmar-lanca-dia/confirmar-lancar-dia";

export const makeConfirmarLancarDiaController = (): Controller => {
  const confirmarLancaDiaPostgresRepository = new ConfirmarLancaDiaPostgresRepository();
  const confirmarLancaDiaController = new ConfirmarLancaDiaController(confirmarLancaDiaPostgresRepository);
  return new LogControllerDecorator(confirmarLancaDiaController);
};
