import { ListarDescricacoRepsository } from "@infra/db/postgresdb/listar-descricao-repository/listar-descricao-repository";

import { ListarDescricacoController } from "../../presentation/controllers/listar-descricao/listar-descricao-controler";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeDescricacoController = (): Controller => {
  const listarDescricacoRepsository = new ListarDescricacoRepsository();
  const listarDescricacoController = new ListarDescricacoController(listarDescricacoRepsository);
  return new LogControllerDecorator(listarDescricacoController);
};
