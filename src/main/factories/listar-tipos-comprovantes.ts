import { ListarComprovantesRepsository } from "@infra/db/postgresdb/listar-comprovantes/listar-comprovantes";

import { ListarComprovanteController } from "../../presentation/controllers/listar-comprovantes/listar-comprovantes-controler";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeListarComprovantesController = (): Controller => {
  const listarComprovantesRepsository = new ListarComprovantesRepsository();
  const listarComprovanteController = new ListarComprovanteController(listarComprovantesRepsository);
  return new LogControllerDecorator(listarComprovanteController);
};
