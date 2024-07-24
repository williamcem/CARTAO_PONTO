import { ListarTodosAtestadoRepsository } from "@infra/db/postgresdb/listar-todos-atestados/listar-todos-atestados";

import { ListarTodosAtestadoController } from "../../presentation/controllers/listar-todos-atestados/listar-todos-atestados-controler";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeListarTodosAtestadosController = (): Controller => {
  const listarTodosAtestadoRepsository = new ListarTodosAtestadoRepsository();
  const listarTodosAtestadoController = new ListarTodosAtestadoController(listarTodosAtestadoRepsository);
  return new LogControllerDecorator(listarTodosAtestadoController);
};
