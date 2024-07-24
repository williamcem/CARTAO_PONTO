import { ListarStatusDocumentoRepsository } from "@infra/db/postgresdb/listar-status-documento/listar-status-documento";

import { ListarStatusDocumentoController } from "../../presentation/controllers/listar-status-documento/listar-status-documento-controller";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeListarStatusDocumentoController = (): Controller => {
  const listarStatusDocumentoRepsository = new ListarStatusDocumentoRepsository();
  const listarStatusDocumentoController = new ListarStatusDocumentoController(listarStatusDocumentoRepsository);
  return new LogControllerDecorator(listarStatusDocumentoController);
};
