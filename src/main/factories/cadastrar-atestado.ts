import { AtestadoRepository } from "@infra/db/postgresdb/atestado-repository/atestado-repository";

import { AtestadoController } from "../../presentation/controllers/cadastrar-atestado/cadastrar-atestado";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeCadastrarAtestadosController = (): Controller => {
  const atestadoRepository = new AtestadoRepository();
  const atestadoController = new AtestadoController(atestadoRepository);
  return new LogControllerDecorator(atestadoController);
};
