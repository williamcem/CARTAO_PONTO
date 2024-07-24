import { ListarAtestados60DiasRepository } from "@infra/db/postgresdb/listar-atestados-60-dias/listar-atestados-60-dias";

import { ListarAtestado60DiasController } from "../../presentation/controllers/listar-atestados-60-dias/listar-atestados-60-dias-controler";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeListarAtestados60DiasController = (): Controller => {
  const listarAtestados60DiasRepository = new ListarAtestados60DiasRepository();
  const listarAtestado60DiasController = new ListarAtestado60DiasController(listarAtestados60DiasRepository);
  return new LogControllerDecorator(listarAtestado60DiasController);
};
