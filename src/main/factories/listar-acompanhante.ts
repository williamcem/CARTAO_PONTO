import { ListarAcompanahanteRepsository } from "@infra/db/postgresdb/listar-acompanhante/listar-acompanhante-repository";

import { ListarAcompanhanteController } from "../../presentation/controllers/listar-acompanhante/listar-acompanhante-controler";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeListarAcompanhanteController = (): Controller => {
  const listarAcompanahanteRepsository = new ListarAcompanahanteRepsository();
  const listarAcompanhanteController = new ListarAcompanhanteController(listarAcompanahanteRepsository);
  return new LogControllerDecorator(listarAcompanhanteController);
};
