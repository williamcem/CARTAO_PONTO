import { AtestadoAprovadoRepository } from "@infra/db/postgresdb/atestado-aprovado-repository/atestado-aprovado-repository";

import { AtestadoAprovadoController } from "../../presentation/controllers/cadastrar-atestado-aprovado/cadastrar-atestado-aprovado";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeCadastrarAtestadoAprovadoController = (): Controller => {
  const atestadoAprovadoRepository = new AtestadoAprovadoRepository();
  const atestadoAprovadoController = new AtestadoAprovadoController(atestadoAprovadoRepository);
  return new LogControllerDecorator(atestadoAprovadoController);
};
