import { ListarDescricacoRepsository } from "@infra/db/postgresdb/listar-descricacao-repository/listar-descricacao-repository";

import { ListarDescricacoController } from "../../presentation/controllers/listar-descricacao/listar-descricacao-controler";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeDescricacoController = (): Controller => {
  const listarDescricacoRepsository = new ListarDescricacoRepsository();
  const listarDescricacoController = new ListarDescricacoController(listarDescricacoRepsository);
  return new LogControllerDecorator(listarDescricacoController);
};
