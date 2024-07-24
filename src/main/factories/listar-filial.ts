import { ListarFilialRepsository } from "@infra/db/postgresdb/listar-filial-repository/listar-status-lancamento-repository";

import { ListarStatusController } from "../../presentation/controllers/listar-filial/listar-filial-controller";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeListarFilialController = (): Controller => {
  const listarFilialRepsository = new ListarFilialRepsository();
  const listarStatusController = new ListarStatusController(listarFilialRepsository);
  return new LogControllerDecorator(listarStatusController);
};
