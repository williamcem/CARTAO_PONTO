import { ListarAtestadoRepsository } from "@infra/db/postgresdb/listar-atestados-não-analisados/listar-atestados";

import { ListarAtestadoController } from "../../presentation/controllers/listar-atestados-não-analisados/listar-atestados-controler";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeListarAtestadosController = (): Controller => {
  const listarAtestadoRepsository = new ListarAtestadoRepsository();
  const listarAtestadoController = new ListarAtestadoController(listarAtestadoRepsository);
  return new LogControllerDecorator(listarAtestadoController);
};
