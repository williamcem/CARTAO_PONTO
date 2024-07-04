import { ListarAtestadoRepsository } from "@infra/db/postgresdb/listar-atestados/listar-atestados";

import { ListarAtestadoController } from "../../presentation/controllers/listar-atestados/listar-atestados-controler";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeListarAtestadosController = (): Controller => {
  const listarAtestadoRepsository = new ListarAtestadoRepsository();
  const listarAtestadoController = new ListarAtestadoController(listarAtestadoRepsository);
  return new LogControllerDecorator(listarAtestadoController);
};
