import { ListarDocumentoRepsository } from "@infra/db/postgresdb/listar-documento/listar-documento";

import { ListarDocumentoController } from "../../presentation/controllers/listar-documento/listar-documento-controller";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeListarDocumentoController = (): Controller => {
  const listarDocumentoRepsository = new ListarDocumentoRepsository();
  const listarDocumentoController = new ListarDocumentoController(listarDocumentoRepsository);
  return new LogControllerDecorator(listarDocumentoController);
};
