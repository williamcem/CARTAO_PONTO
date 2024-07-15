import { ListarDescricacoRepsository } from "@infra/db/postgresdb/listar-descricaco-repository/listar-descricaco-repository";

import { ListarDescricacoController } from "../../presentation/controllers/listar-descricaco/listar-descricaco-controler";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeDescricacoController = (): Controller => {
  const listarDescricacoRepsository = new ListarDescricacoRepsository();
  const listarDescricacoController = new ListarDescricacoController(listarDescricacoRepsository);
  return new LogControllerDecorator(listarDescricacoController);
};
